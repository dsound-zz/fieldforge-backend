import { pool } from "../../config/db";
import { logger } from "../../config/logger";
import { notFound } from "../../utils/errors";
import { Invoice, Payment } from "./types";

export const listInvoices = async (): Promise<Invoice[]> => {
  const result = await pool.query("SELECT * FROM invoices ORDER BY created_at DESC");
  return result.rows;
};

export const payInvoice = async (invoice_id: number, amount: number): Promise<{ invoice: Invoice; payment: Payment }> => {
  await pool.query("BEGIN");
  try {
    const invoiceResult = await pool.query("SELECT * FROM invoices WHERE id = $1", [invoice_id]);
    const invoice = invoiceResult.rows[0];
    if (!invoice) throw notFound("Invoice", invoice_id);

    const paymentResult = await pool.query(
      `INSERT INTO payments(invoice_id, amount) VALUES($1, $2) RETURNING *`,
      [invoice_id, amount]
    );
    await pool.query(`UPDATE invoices SET status = 'paid' WHERE id = $1`, [invoice_id]);

    await pool.query(`INSERT INTO logs(event_type, event_data) VALUES($1, $2)`, [
      "payment_created",
      { invoice_id, amount }
    ]);

    await pool.query("COMMIT");
    return { invoice: { ...invoice, status: "paid" }, payment: paymentResult.rows[0] };
  } catch (err) {
    await pool.query("ROLLBACK");
    logger.error({ err }, "Failed to pay invoice");
    throw err;
  }
};
