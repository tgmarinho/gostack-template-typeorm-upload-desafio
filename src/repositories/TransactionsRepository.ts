import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

enum Type {
  INCOME = 'income',
  OUTCOME = 'outcome',
}

interface TypeDTO {
  income: number;
  outcome: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private calculateBalance(transactions: Array<Transaction>): TypeDTO {
    return transactions.reduce(
      (accumulator, transaction) => {
        switch (transaction.type) {
          case Type.INCOME:
            accumulator.income += Number(transaction.value);
            break;
          case Type.OUTCOME:
            accumulator.outcome += Number(transaction.value);
            break;
          default:
            break;
        }

        return accumulator;
      },
      { income: 0, outcome: 0 },
    );
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome } = this.calculateBalance(transactions);
    const total = income - outcome;

    const balance: Balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
