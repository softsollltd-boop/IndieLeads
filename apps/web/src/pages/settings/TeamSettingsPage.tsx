
import React, { useState } from 'react';
import { Users, UserPlus, Copy, Check, Mail, Shield, Loader2 } from 'lucide-react';
import apiClient from '../../utils/api-client';

const TeamSettingsPage: React.FC<{ workspace?: { id: string } }> = ({ workspace }) => {
    const isEthereal = true;
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mock Members Data (Replace with API call later)
    const members = [
        { id: '1', name: 'You', email: 'admin@indieleads.ai', role: 'Owner', avatar: 'ME' },
    ];

    const generateInvite = async () => {
        setIsLoading(true);
        try {
            const workspaceId = workspace?.id || 'w1'; // Fallback for dev if not passed
            const res = await apiClient.post(`/workspaces/${workspaceId}/invites`);
            setInviteLink(res.data.inviteUrl);
        } catch (e) {
            console.error('Failed to generate invite', e);
        } finally {
            setIsLoading(false);
        }
    };

    const copyLink = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-8 text-slate-800">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-heading text-slate-900">Team Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage access to your workspace and billing.</p>
                </div>
                <button
                    onClick={generateInvite}
                    disabled={isLoading || !!inviteLink}
                    className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    {inviteLink ? 'Link Generated' : 'Invite Member'}
                </button>
            </div>

            {/* Invite Link Section */}
            {inviteLink && (
                <div className="p-6 rounded-2xl border bg-emerald-50 border-emerald-200">
                    <h4 className="text-sm font-bold mb-2 text-emerald-800">
                        Share this link to invite members
                    </h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={inviteLink}
                            className="flex-1 px-4 py-3 rounded-xl font-mono text-sm border focus:outline-none bg-white border-emerald-200 text-emerald-900"
                        />
                        <button
                            onClick={copyLink}
                            className="px-4 rounded-xl flex items-center gap-2 font-bold transition-colors bg-emerald-200 hover:bg-emerald-300 text-emerald-900"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-xs mt-2 opacity-60 flex items-center gap-1">
                        <Shield size={12} />
                        Link expires in 7 days. Anyone with this link can join as a Member.
                    </p>
                </div>
            )}

            {/* Members List */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Users size={20} className="text-slate-400" />
                    Active Members
                </h3>

                <div className="space-y-3">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-white hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs bg-slate-50 text-slate-600">
                                    {member.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">{member.name} {member.id === '1' && '(You)'}</h4>
                                    <p className="text-xs text-slate-500">{member.email}</p>
                                </div>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                {member.role}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamSettingsPage;
