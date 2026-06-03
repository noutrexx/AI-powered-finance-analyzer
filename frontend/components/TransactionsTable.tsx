import type { Transaction } from "@/types/finance";

type Props = {
  items: Transaction[];
};

export function TransactionsTable({ items }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.date}</td>
              <td>{transaction.description}</td>
              <td>
                <span className="pill">{transaction.category}</span>
              </td>
              <td>{transaction.type}</td>
              <td className={transaction.type === "income" ? "amount-income" : "amount-expense"}>
                {formatCurrency(transaction.amount, transaction.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function formatCurrency(amount: string | number, currency = "TL") {
  const value = Number(amount);
  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

