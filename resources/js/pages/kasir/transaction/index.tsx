import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

interface Transaction {
    id: number;
    invoice_number: string;
    subtotal: number;
    discount: number;
    total: number;
    payment_method: string;
    status: string;
    created_at: string;
    user: { name: string };
}

interface Props {
    transactions: Transaction[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transaksi', href: '/kasir/transactions' },
];

const statusBadge = (status: string) => {
    return status === 'completed'
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-600';
};

export default function TransactionIndex({ transactions }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleCancel = (id: number) => {
        if (confirm('Yakin ingin membatalkan transaksi ini? Stok produk akan dikembalikan.')) {
            destroy(route('kasir.transactions.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaksi" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Daftar Transaksi</h1>
                    <Link
                        href={route('kasir.transactions.create')}
                        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                        + Transaksi Baru
                    </Link>
                </div>

                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-4 py-2">No. Nota</th>
                                <th className="px-4 py-2">Kasir</th>
                                <th className="px-4 py-2">Total</th>
                                <th className="px-4 py-2">Pembayaran</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Tanggal</th>
                                <th className="px-4 py-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                                        Belum ada transaksi.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((trx) => (
                                    <tr key={trx.id} className="border-t">
                                        <td className="px-4 py-2 font-mono font-medium">{trx.invoice_number}</td>
                                        <td className="px-4 py-2">{trx.user?.name}</td>
                                        <td className="px-4 py-2">Rp {Number(trx.total).toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-2 capitalize">{trx.payment_method}</td>
                                        <td className="px-4 py-2">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(trx.status)}`}>
                                                {trx.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-gray-500">
                                            {new Date(trx.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link
                                                href={route('kasir.transactions.show', trx.id)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Detail
                                            </Link>
                                            {trx.status === 'completed' && (
                                                <button
                                                    onClick={() => handleCancel(trx.id)}
                                                    disabled={processing}
                                                    className="text-red-500 hover:underline"
                                                >
                                                    Batalkan
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
