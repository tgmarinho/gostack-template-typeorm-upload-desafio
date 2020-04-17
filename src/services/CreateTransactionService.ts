import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: {
    title: string;
  };
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    try {
      const transactionsRepository = getCustomRepository(
        TransactionsRepository,
      );

      const categoryRepository = getRepository(Category);

      const categoryExistsWithTitle = await categoryRepository.findOne({
        where: { title: category.title },
      });

      let categoryCreated = null;

      if (!categoryExistsWithTitle) {
        categoryCreated = await categoryRepository.create({
          title: category.title,
        });

        await categoryRepository.save(categoryCreated);
      }

      const transaction = await transactionsRepository.create({
        title,
        value,
        type,
        category_id:
          (categoryExistsWithTitle && categoryExistsWithTitle.id) ||
          categoryCreated?.id,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    } catch (error) {
      throw new AppError('Ops, error! the admin was notified', 500);
    }
  }
}

export default CreateTransactionService;
