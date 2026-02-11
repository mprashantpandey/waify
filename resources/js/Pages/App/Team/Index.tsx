import { Head, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { useNotifications } from '@/hooks/useNotifications';
import { 
    Users, 
    UserPlus, 
    Crown, 
    Shield, 
    User,
    Trash2,
    Edit,
    Mail,
    Calendar,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';

interface Member {
    id: number;
    name: string;
    email: string;
    role: string;
    joined_at: string;
    is_owner: boolean;
    account_user_id?: number;
}

interface PendingInvite {
    id: number;
    email: string;
    role: string;
    invited_at?: string | null;
    expires_at?: string | null;
}

export default function TeamIndex({ 
    account, 
    members, 
    can_manage, 
    current_user_id,
    pending_invites
}: { 
    account: any;
    members: Member[];
    can_manage: boolean;
    current_user_id: number;
    pending_invites: PendingInvite[];
}) {
    const { confirm, toast } = useNotifications();
    const [inviteEmail, setInviteEmail] = useState('');
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const handleInvite = () => {
        if (!inviteEmail) {
            toast.error('Please enter an email');
            return;
        }

        router.post(
            route('app.team.invite', {}),
            {
                email: inviteEmail,
                role: 'member'},
            {
                onSuccess: () => {
                    setInviteEmail('');
                    setShowInviteDialog(false);
                },
                onError: (errors) => {
                    const firstError = errors.email || errors.role || errors.error;
                    toast.error(firstError || 'Failed to invite member');
                }}
        );
    };

    const handleUpdateRole = async (member: Member, newRole: string) => {
        if (member.role === newRole) return;

        const confirmed = await confirm({
            title: 'Update Role',
            message: `Change ${member.name}'s role to ${newRole}?`,
            variant: 'info'});

        if (confirmed) {
            router.post(
                route('app.team.update-role', { user: member.id }),
                { role: newRole },
                {
                    onSuccess: () => {
                        setEditingMember(null);
                    },
                    onError: () => {
                        toast.error('Failed to update role');
                    }}
            );
        }
    };

    const handleRemove = async (member: Member) => {
        const confirmed = await confirm({
            title: 'Remove Member',
            message: `Are you sure you want to remove ${member.name} from this account?`,
            variant: 'danger',
            confirmText: 'Remove'});

        if (confirmed) {
            router.delete(
                route('app.team.remove', { user: member.id }),
                {
                    onSuccess: () => {
                        router.reload({ only: ['members'] });
                    },
                    onError: () => {
                        toast.error('Failed to remove member');
                    }}
            );
        }
    };

    const handleRevokeInvite = async (invite: PendingInvite) => {
        const confirmed = await confirm({
            title: 'Revoke Invitation',
            message: `Revoke invitation for ${invite.email}?`,
            variant: 'danger',
            confirmText: 'Revoke'});

        if (confirmed) {
            router.delete(
                route('app.team.invites.revoke', { invitation: invite.id }),
                {
                    onSuccess: () => {},
                    onError: () => {
                        toast.error('Failed to revoke invitation');
                    }}
            );
        }
    };

    const handleResendInvite = async (invite: PendingInvite) => {
        const confirmed = await confirm({
            title: 'Resend Invitation',
            message: `Resend invitation to ${invite.email}?`,
            variant: 'info',
            confirmText: 'Resend'});

        if (confirmed) {
            router.post(
                route('app.team.invites.resend', { invitation: invite.id }),
                {},
                {
                    onSuccess: () => {},
                    onError: () => {
                        toast.error('Failed to resend invitation');
                    }}
            );
        }
    };

    const getExpiryInfo = (invite: PendingInvite) => {
        if (!invite.expires_at) return null;
        const expiresAt = new Date(invite.expires_at);
        const now = new Date();
        if (expiresAt <= now) {
            return { label: 'Expired', variant: 'danger' as const, daysLeft: 0, expired: true };
        }
        const diffMs = expiresAt.getTime() - now.getTime();
        const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return { label: `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`, variant: 'warning' as const, daysLeft, expired: false };
    };

    const getRoleBadge = (role: string, isOwner: boolean) => {
        if (isOwner) {
            return (
                <Badge variant="warning" className="flex items-center gap-1.5 px-3 py-1">
                    <Crown className="h-3.5 w-3.5" />
                    Owner
                </Badge>
            );
        }
        
        if (role === 'admin') {
            return (
                <Badge variant="info" className="flex items-center gap-1.5 px-3 py-1">
                    <Shield className="h-3.5 w-3.5" />
                    Legacy Admin
                </Badge>
            );
        }
        
        return (
            <Badge variant="default" className="flex items-center gap-1.5 px-3 py-1">
                <User className="h-3.5 w-3.5" />
                Chat Agent
            </Badge>
        );
    };

    return (
        <AppShell>
            <Head title="Team" />
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Team
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage your team members
                        </p>
                    </div>
                    {can_manage && (
                        <Button 
                            onClick={() => setShowInviteDialog(true)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Member
                        </Button>
                    )}
                </div>

                {/* Invite Dialog */}
                {showInviteDialog && (
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Invite Team Member
                            </CardTitle>
                            <CardDescription>Invite a user to join your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div>
                                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="mt-2"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    New users can accept the invite and sign up from the invite link
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="role" className="text-sm font-semibold">Role</Label>
                                <div
                                    id="role"
                                    className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200"
                                >
                                    Chat Agent
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <Button onClick={handleInvite} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                    Send Invitation
                                </Button>
                                <Button variant="secondary" onClick={() => setShowInviteDialog(false)} className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {can_manage && pending_invites && pending_invites.length > 0 && (
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                Pending Invitations
                            </CardTitle>
                            <CardDescription>Invitations that are waiting for acceptance</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3">
                            {pending_invites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="flex items-center justify-between rounded-xl border border-amber-100 dark:border-amber-900/40 bg-white dark:bg-gray-900 px-4 py-3"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-gray-100">{invite.email}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Role: {invite.role}
                                            {invite.expires_at ? ` • Expires ${new Date(invite.expires_at).toLocaleDateString()}` : ''}
                                        </div>
                                        {invite.expires_at && (
                                            <div className="mt-1">
                                                {(() => {
                                                    const info = getExpiryInfo(invite);
                                                    if (!info) return null;
                                                    return (
                                                        <Badge variant={info.variant} className="text-xs">
                                                            {info.label}
                                                        </Badge>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleResendInvite(invite)}
                                        >
                                            Resend
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleRevokeInvite(invite)}
                                        >
                                            Revoke
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Members List */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Team Members</CardTitle>
                                <CardDescription className="mt-1">{members.length} total members</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                    {member.name}
                                                </p>
                                                {member.id === current_user_id && (
                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {member.email}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getRoleBadge(member.role, member.is_owner)}
                                        {can_manage && !member.is_owner && member.id !== current_user_id && (
                                            <div className="flex items-center gap-2">
                                                {editingMember?.id === member.id ? (
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) => handleUpdateRole(member, e.target.value)}
                                                        className="text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-3 py-1.5"
                                                        onBlur={() => setEditingMember(null)}
                                                        autoFocus
                                                    >
                                                        {member.role !== 'member' && (
                                                            <option value={member.role}>
                                                                {member.role === 'admin' ? 'Legacy Admin' : member.role}
                                                            </option>
                                                        )}
                                                        <option value="member">Chat Agent</option>
                                                    </select>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingMember(member)}
                                                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemove(member)}
                                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
