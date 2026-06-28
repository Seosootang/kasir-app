<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Tampilkan daftar semua transaksi.
     */
    public function index(): Response
    {
        $transactions = Transaction::with('user')
            ->latest()
            ->get();

        return Inertia::render('kasir/transaction/index', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * Tampilkan halaman kasir (POS) untuk membuat transaksi baru.
     */
    public function create(): Response
    {
        $products = Product::with('category')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->get();

        return Inertia::render('kasir/transaction/create', [
            'products' => $products,
        ]);
    }

    /**
     * Simpan transaksi baru beserta item-itemnya.
     * Menggunakan DB transaction untuk menjaga konsistensi data.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items'                    => 'required|array|min:1',
            'items.*.product_id'       => 'required|exists:products,id',
            'items.*.quantity'         => 'required|integer|min:1',
            'discount'                 => 'nullable|numeric|min:0',
            'paid_amount'              => 'required|numeric|min:0',
            'payment_method'           => 'required|in:cash,transfer,qris',
            'notes'                    => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Hitung subtotal dari item-item
            $subtotal = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Pastikan stok cukup
                abort_if($product->stock < $item['quantity'], 422, "Stok {$product->name} tidak mencukupi.");

                $itemSubtotal = $product->price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $itemsToCreate[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'price'        => $product->price,
                    'quantity'     => $item['quantity'],
                    'subtotal'     => $itemSubtotal,
                ];

                // Kurangi stok produk
                $product->decrement('stock', $item['quantity']);
            }

            $discount     = $validated['discount'] ?? 0;
            $total        = $subtotal - $discount;
            $paidAmount   = $validated['paid_amount'];
            $changeAmount = $paidAmount - $total;

            // Buat nomor invoice otomatis: INV-YYYYMMDD-XXXX
            $invoiceNumber = 'INV-' . now()->format('Ymd') . '-' . str_pad(
                Transaction::whereDate('created_at', today())->count() + 1,
                4, '0', STR_PAD_LEFT
            );

            // Simpan header transaksi
            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'user_id'        => $request->user()->id,
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'total'          => $total,
                'paid_amount'    => $paidAmount,
                'change_amount'  => $changeAmount,
                'payment_method' => $validated['payment_method'],
                'status'         => 'completed',
                'notes'          => $validated['notes'] ?? null,
            ]);

            // Simpan item-item transaksi
            $transaction->items()->createMany($itemsToCreate);
        });

        return redirect()->route('kasir.transactions.index')
            ->with('success', 'Transaksi berhasil disimpan.');
    }

    /**
     * Tampilkan detail satu transaksi beserta item-itemnya.
     */
    public function show(Transaction $transaction): Response
    {
        return Inertia::render('kasir/transaction/show', [
            'transaction' => $transaction->load(['user', 'items.product']),
        ]);
    }

    /**
     * Batalkan transaksi dan kembalikan stok produk.
     */
    public function destroy(Transaction $transaction)
    {
        if ($transaction->status === 'cancelled') {
            return redirect()->route('kasir.transactions.index')
                ->with('error', 'Transaksi sudah dibatalkan sebelumnya.');
        }

        DB::transaction(function () use ($transaction) {
            // Kembalikan stok setiap produk
            foreach ($transaction->items as $item) {
                Product::where('id', $item->product_id)
                    ->increment('stock', $item->quantity);
            }

            $transaction->update(['status' => 'cancelled']);
        });

        return redirect()->route('kasir.transactions.index')
            ->with('success', 'Transaksi berhasil dibatalkan.');
    }
}
