'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IndustrialGrid } from '@/components/industrial-grid';
import { Plus, Trash2, GripVertical, Image as ImageIcon, LogOut, Loader2, Link as LinkIcon, Boxes } from 'lucide-react';
import { addLink, deleteLink, updateLink, updateLinkOrder, logout, uploadIcon } from '../actions';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { LinkCard } from '@/components/link-card';
import Image from 'next/image';

interface Link {
    id: number;
    title: string;
    url: string;
    icon_url: string | null;
    order_index: number;
}

export default function AdminPanel({ initialLinks }: { initialLinks: Link[] }) {
    const router = useRouter();
    const [links, setLinks] = useState(initialLinks);
    const [isAdding, setIsAdding] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [uploading, setUploading] = useState(false);
    const [newLink, setNewLink] = useState({ title: '', url: '', icon_url: '' });
    const [editingLink, setEditingLink] = useState<Link | null>(null);

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(links);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            order_index: index,
        }));

        setLinks(updatedItems);

        startTransition(async () => {
            await updateLinkOrder(updatedItems.map(item => ({ id: item.id, order_index: item.order_index })));
        });
    };

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newLink.title);
        formData.append('url', newLink.url);
        formData.append('icon_url', newLink.icon_url);

        startTransition(async () => {
            const res = await addLink(formData);
            if (res.success) {
                setNewLink({ title: '', url: '', icon_url: '' });
                setIsAdding(false);
                router.refresh();
            }
        });
    };

    const handleUpdateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLink) return;

        const formData = new FormData();
        formData.append('title', editingLink.title);
        formData.append('url', editingLink.url);
        formData.append('icon_url', editingLink.icon_url || '');

        startTransition(async () => {
            const res = await updateLink(editingLink.id, formData);
            if (res.success) {
                setLinks(prev => prev.map(l => l.id === editingLink.id ? editingLink : l));
                setEditingLink(null);
                router.refresh();
            }
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminate this channel?')) return;
        startTransition(async () => {
            await deleteLink(id);
            setLinks(prev => prev.filter(l => l.id !== id));
        });
    };

    const processFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Only images are allowed');
            return;
        }

        setUploading(true);
        try {
            const url = await uploadIcon(file);
            if (editingLink) {
                setEditingLink(prev => prev ? ({ ...prev, icon_url: url }) : null);
            } else {
                setNewLink(prev => ({ ...prev, icon_url: url }));
            }
        } catch {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    }, [editingLink, setNewLink, setEditingLink]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!isAdding && !editingLink) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) processFile(file);
                    break;
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isAdding, editingLink, processFile]);

    return (
        <main className="relative min-h-screen py-10 px-4">
            <IndustrialGrid />

            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-2xl bg-metal-blue/10 border border-metal-blue/20">
                            <Boxes className="w-10 h-10 text-metal-blue" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white mb-0.5">COMMAND CENTER</h1>
                            <p className="text-metal-blue font-mono text-[10px] uppercase tracking-[0.4em] opacity-50">Authorized Operator Panel</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-sm font-bold"
                    >
                        <LogOut className="w-4 h-4" /> TERMINATE SESSION
                    </button>
                </div>

                {/* Add Link Form */}
                <div className="mb-16">
                    {!isAdding && !editingLink ? (
                        <motion.button
                            whileHover={{ scale: 1.01, borderColor: '#00A3FF' }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setIsAdding(true)}
                            className="w-full py-6 border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02] text-white/40 hover:text-metal-blue transition-all flex flex-col items-center justify-center gap-3 font-bold uppercase tracking-[0.3em] text-xs"
                        >
                            <div className="p-4 rounded-full bg-metal-blue/10 border border-metal-blue/20">
                                <Plus className="w-6 h-6" />
                            </div>
                            Initialize New Channel
                        </motion.button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            <form
                                onSubmit={handleAddLink}
                                className="p-8 border border-white/10 bg-metal-charcoal/50 backdrop-blur-2xl rounded-3xl space-y-6 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-metal-blue/50" />

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Protocol Label</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. GitHub Repository"
                                            value={newLink.title}
                                            onChange={e => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white focus:border-metal-blue outline-none transition-all font-bold placeholder:text-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Destination URL</label>
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://..."
                                            value={newLink.url}
                                            onChange={e => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white focus:border-metal-blue outline-none transition-all font-mono text-sm placeholder:text-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest block">Visual Identifier</label>
                                    <div
                                        className={`relative group h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${newLink.icon_url ? 'border-metal-blue/30 bg-metal-blue/5' : 'border-white/10 bg-black/20'
                                            }`}
                                    >
                                        {newLink.icon_url ? (
                                            <>
                                                <Image src={newLink.icon_url} alt="Preview" fill className="object-cover opacity-50 blur-sm" quality={100} />
                                                <div className="relative z-10 w-24 h-24 rounded-2xl border-2 border-metal-blue shadow-2xl shadow-metal-blue/20 overflow-hidden">
                                                    <Image src={newLink.icon_url} alt="Preview" fill className="object-cover" quality={100} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                    <ImageIcon className="w-8 h-8 text-white/20" />
                                                </div>
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Pasted image data detected</p>
                                            </>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-50">
                                                <Loader2 className="w-8 h-8 text-metal-blue animate-spin" />
                                                <p className="text-[10px] text-metal-blue font-mono animate-pulse">UPLOADING DATA...</p>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="icon-upload"
                                        />
                                        <label
                                            htmlFor="icon-upload"
                                            className="absolute inset-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[9px] text-white/20 max-w-[150px] leading-relaxed italic">
                                            (CLICK BOX TO SELECT OR PASTE IMAGE DIRECTLY)
                                        </p>
                                        {newLink.icon_url && (
                                            <button
                                                type="button"
                                                onClick={() => setNewLink(prev => ({ ...prev, icon_url: '' }))}
                                                className="text-[10px] text-red-500/50 hover:text-red-500 font-bold uppercase"
                                            >
                                                Purge Image
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isPending || uploading}
                                        className="flex-grow bg-metal-blue hover:bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-metal-blue/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {isPending ? 'STABILIZING...' : 'ESTABLISH CHANNEL'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="px-6 border border-white/10 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase text-[10px] font-bold"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </form>

                            <div className="hidden lg:flex flex-col gap-4">
                                <p className="text-[10px] text-metal-blue font-black tracking-[0.3em] uppercase">Real-Time Preview</p>
                                <div className="p-12 border border-white/5 bg-black/40 rounded-3xl flex items-center justify-center min-h-[300px] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-industrial-grid bg-[length:12px_12px] opacity-10" />
                                    <LinkCard
                                        title={newLink.title || 'CHANNEL ALPHA'}
                                        url={newLink.url || 'https://metaltroop.com'}
                                        iconUrl={newLink.icon_url || null}
                                    />
                                </div>
                                <div className="p-4 rounded-2xl bg-metal-yellow/5 border border-metal-yellow/20 flex gap-3 items-start">
                                    <div className="p-1 rounded-md bg-metal-yellow/20 text-metal-yellow mt-0.5">
                                        <Plus className="w-3 h-3" />
                                    </div>
                                    <p className="text-[10px] text-metal-yellow/60 leading-relaxed font-mono">
                                        Note: All channels must follow Protocol 7 encryption standards for public transmission.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {editingLink && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            <form
                                onSubmit={handleUpdateLink}
                                className="p-8 border border-metal-blue/30 bg-metal-charcoal/50 backdrop-blur-2xl rounded-3xl space-y-6 relative overflow-hidden group shadow-2xl shadow-metal-blue/10"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-metal-blue" />
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-metal-blue/10 text-metal-blue">
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Modify Channel</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Protocol Label</label>
                                        <input
                                            type="text"
                                            required
                                            value={editingLink.title}
                                            onChange={e => setEditingLink(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white focus:border-metal-blue outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Destination URL</label>
                                        <input
                                            type="url"
                                            required
                                            value={editingLink.url}
                                            onChange={e => setEditingLink(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white focus:border-metal-blue outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest block">Visual Identifier</label>
                                    <div
                                        className="relative group h-48 rounded-2xl border-2 border-dashed border-metal-blue/30 bg-metal-blue/5 transition-all flex flex-col items-center justify-center gap-3 overflow-hidden"
                                    >
                                        {editingLink.icon_url ? (
                                            <>
                                                <Image src={editingLink.icon_url} alt="Preview" fill className="object-cover opacity-30 blur-sm" quality={100} />
                                                <div className="relative z-10 w-24 h-24 rounded-2xl border-2 border-metal-blue shadow-2xl shadow-metal-blue/20 overflow-hidden">
                                                    <Image src={editingLink.icon_url} alt="Preview" fill className="object-cover" quality={100} />
                                                </div>
                                            </>
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-white/10" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-50">
                                                <Loader2 className="w-8 h-8 text-metal-blue animate-spin" />
                                                <p className="text-[10px] text-metal-blue font-mono animate-pulse">RECODING DATA...</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="edit-icon-upload" />
                                        <label htmlFor="edit-icon-upload" className="absolute inset-0 cursor-pointer" />
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[9px] text-white/20 italic">(PASTE NEW IMAGE TO OVERWRITE)</p>
                                        {editingLink.icon_url && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingLink(prev => prev ? ({ ...prev, icon_url: '' }) : null)}
                                                className="text-[10px] text-red-500/50 hover:text-red-500 font-bold uppercase"
                                            >
                                                Purge
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isPending || uploading}
                                        className="flex-grow bg-metal-blue hover:bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-metal-blue/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {isPending ? 'RECALIBRATING...' : 'UPDATE CHANNEL'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingLink(null)}
                                        className="px-6 border border-white/10 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase text-[10px] font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>

                            <div className="hidden lg:flex flex-col gap-4">
                                <p className="text-[10px] text-metal-blue font-black tracking-[0.3em] uppercase">Live Overlook</p>
                                <div className="p-12 border border-white/10 bg-black/60 rounded-[40px] flex items-center justify-center min-h-[300px] relative overflow-hidden shadow-inner">
                                    <div className="absolute inset-0 bg-industrial-grid bg-[length:16px_16px] opacity-[0.05]" />
                                    <LinkCard
                                        title={editingLink.title || 'CHANNEL NAME'}
                                        url={editingLink.url || 'https://...'}
                                        iconUrl={editingLink.icon_url || null}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Links List */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="text-[10px] font-black text-white/20 tracking-[0.5em] uppercase">Active Transmissions</span>
                        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="links">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                    {links.map((link, index) => (
                                        <Draggable key={link.id} draggableId={link.id.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <motion.div
                                                    layout
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`group relative flex items-center gap-6 p-5 border border-white/5 bg-white/[0.03] backdrop-blur-xl rounded-2xl transition-all ${snapshot.isDragging
                                                        ? 'border-metal-blue bg-metal-blue/10 shadow-2xl shadow-metal-blue/20 scale-[1.02] z-50'
                                                        : 'hover:border-white/20 hover:bg-white/[0.05]'
                                                        }`}
                                                >
                                                    <div {...provided.dragHandleProps} className="text-white/10 group-hover:text-metal-blue transition-colors cursor-grab active:cursor-grabbing">
                                                        <GripVertical className="w-6 h-6" />
                                                    </div>

                                                    <div className="flex-grow flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-xl border border-white/10 bg-metal-charcoal flex-shrink-0 relative overflow-hidden shadow-inner group-hover:border-metal-blue/30 transition-colors">
                                                            {link.icon_url ? (
                                                                <Image src={link.icon_url} alt={link.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <LinkIcon className="w-6 h-6 text-white/10 m-auto mt-5" />
                                                            )}
                                                        </div>

                                                        <div className="flex-grow">
                                                            <h3 className="font-black text-white text-lg tracking-tight mb-0.5 group-hover:text-metal-blue transition-colors uppercase">{link.title}</h3>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-metal-blue animate-pulse" />
                                                                <p className="text-xs font-mono text-white/30 truncate max-w-[300px] lowercase">{link.url}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => setEditingLink(link)}
                                                            className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                            title="Reconfigure"
                                                        >
                                                            <Plus className="w-5 h-5 rotate-45" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(link.id)}
                                                            className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                            title="Eliminate"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    {/* Glow Accent */}
                                                    <div className="absolute top-0 right-10 w-20 h-px bg-gradient-to-r from-transparent via-metal-blue/20 to-transparent group-hover:via-metal-blue/50 transition-all" />
                                                </motion.div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>
        </main>
    );
}


