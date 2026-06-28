import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface TransactionItem {
    id: number;
    product_name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface Transaction {
    id: number;
    invoice_number: string;
    subtotal: number;
    discount: number;
    total: number;
    paid_amount: number;
    change_amount: number;
    payment_method: string;
    status: string;
    notes: string | null;
    created_at: string;
    user: { name: string };
    items: TransactionItem[];
}

interface Props {
    transaction: Transaction;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transaksi', href: '/kasir/transactions' },
    { title: 'Detail', href: '#' },
];

const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function TransactionShow({ transaction }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail ${transaction.invoice_number}`} />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Detail Transaksi</h1>
                    <Link href={route('kasir.transactions.index')} className="text-sm text-blue-600 hover:underline">
                        ← Kembali
                    </Link>
                </div>

                {/* Info Transaksi */}
                <div className="mb-6 rounded border p-4 text-sm">
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        <div>
                            <p className="text-gray-500">No. Nota</p>
                            <p className="font-mono font-semibold">{transaction.invoice_number}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Kasir</p>
                            <p className="font-medium">{transaction.user?.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Tanggal</p>
                            <p>{new Date(transaction.created_at).toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Pembayaran</p>
                            <p className="capitalize">{transaction.payment_method}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Status</p>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    transaction.status === 'completed'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-600'
                                }`}
                            >
                                {transaction.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                            </span>
                        </div>
                        {transaction.notes && (
                            <div>
                                <p className="text-gray-500">Catatan</p>
                                <p>{transaction.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Item Transaksi */}
                <div className="mb-6 overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-4 py-2">#</th>
                                <th className="px-4 py-2">Produk</th>
                                <th className="px-4 py-2">Harga</th>
                                <th className="px-4 py-2">Qty</th>
                                <th className="px-4 py-2">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaction.items.map((item, i) => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-4 py-2">{i + 1}</td>
                                    <td className="px-4 py-2 font-medium">{item.product_name}</td>
                                    <td className="px-4 py-2">{rp(item.price)}</td>
                                    <td className="px-4 py-2">{item.quantity}</td>
                                    <td className="px-4 py-2">{rp(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Ringkasan Pembayaran */}
                <div className="ml-auto max-w-xs space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>{rp(transaction.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Diskon</span>
                        <span>- {rp(transaction.discount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-semibold">
                        <span>Total</span>
                        <span>{rp(transaction.total)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Dibayar</span>
                        <span>{rp(transaction.paid_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Kembalian</span>
                        <span>{rp(transaction.change_amount)}</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
