import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (value > total)
        throw new AppError(
          'not be able to create outcome transaction without a valid balance',
          400,
        );
    }

    const categoryRepository = getRepository(Category);

    const categoryExistsWithTitle = await categoryRepository.findOne({
      where: { title: category },
    });

    let categoryCreated = null;

    if (!categoryExistsWithTitle) {
      categoryCreated = await categoryRepository.create({
        title: category,
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
  }
}

export default CreateTransactionService;
