import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/adminService';
import { User, Role } from '../../types';
import { toast } from 'react-toastify';
import {
    Trash2, Shield, User as UserIcon, CheckCircle, XCircle,
    MoreVertical, Search, Filter
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await AdminService.getUsers(page);
            setUsers(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Kullanıcılar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            try {
                await AdminService.deleteUser(userId);
                toast.success('Kullanıcı silindi');
                fetchUsers();
            } catch (error) {
                toast.error('Kullanıcı silinemedi');
            }
        }
    };

    const handleToggleStatus = async (userId: number) => {
        try {
            await AdminService.toggleUserStatus(userId);
            toast.success('Kullanıcı durumu güncellendi');
            fetchUsers();
        } catch (error) {
            toast.error('Durum güncellenemedi');
        }
    };

    const handleToggleRole = async (user: User) => {
        const newRoles = user.roles.includes(Role.ROLE_ADMIN)
            ? [Role.ROLE_USER]
            : [Role.ROLE_USER, Role.ROLE_ADMIN];

        try {
            // Role enum to string mapping might be needed if backend expects plain strings
            // Assuming backend accepts payload like ["ROLE_USER", "ROLE_ADMIN"]
            await AdminService.updateUserRoles(user.id, newRoles.map(r => r.toString()));
            toast.success('Roller güncellendi');
            fetchUsers();
        } catch (error) {
            toast.error('Roller güncellenemedi');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
                    <p className="text-gray-500 text-sm mt-1">Toplam {totalElements} kayıtlı kullanıcı</p>
                </div>

                {/* Search & Filter - Placeholder mostly */}
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Kullanıcı ara..."
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex justify-center mb-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                    Yükleniyor...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    Kullanıcı bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {user.name ? `${user.name} ${user.surname}` : user.username}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <span
                                                    key={role}
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${role === Role.ROLE_ADMIN
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}
                                                >
                                                    {role === Role.ROLE_ADMIN ? 'Yönetici' : 'Üye'}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.enabled
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                            }`}>
                                            {user.enabled ? (
                                                <><CheckCircle className="w-3.5 h-3.5" /> Aktif</>
                                            ) : (
                                                <><XCircle className="w-3.5 h-3.5" /> Pasif</>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleRole(user)}
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title={user.roles.includes(Role.ROLE_ADMIN) ? "Yöneticiliği Al" : "Yönetici Yap"}
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user.id)}
                                                className={`p-2 rounded-lg transition-colors ${user.enabled
                                                    ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={user.enabled ? "Engelle" : "Aktifleştir"}
                                            >
                                                {user.enabled ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination settings */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Toplam {totalPages} sayfadan {page + 1}. sayfa gösteriliyor
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Önceki
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sonraki
                    </button>
                </div>
            </div>
        </div>
    );
};
