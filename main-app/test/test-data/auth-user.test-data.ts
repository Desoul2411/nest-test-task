import { Generator as generator } from '../../src/utils/generator.utils';
import * as bcrypt from 'bcrypt';

export const login_admin_dto = {
  email: 'Desoul25@mail.ru',
  password: generator.generateString(12),
};

export const create_user_dto = {
  email: 'Desoul40@mail.ru',
  password: bcrypt.hash(generator.generateString(12), 5),
  name: 'John',
  birthdate: '20.11.88',
};

export const invalid_type_create_user_dto = {
  email: 'Desoul40mail.ru',
  password: generator.generateRandomNumber(0, 1000000),
  name: 'John',
  birthdate: '20.11.88',
};

export const register_user_result = {
  message: 'Registered successfully!',
};

export const invalid_login_user_dto = {
  email: 'Desoulmail.ru',
  password: generator.generateRandomNumber(0, 1000000),
};

export const invalid_password_dto = {
  email: 'Desoul40@mail.ru',
  password: generator.generateString(12),
};

export const unexisting_user_dto = {
  email: 'Desoul45@mail.ru',
  password: generator.generateString(12),
};

export const deleted_user_response_data = {
  email: 'Desoul40@mail.ru',
  password: bcrypt.hash(generator.generateString(12), 5),
  role: 'USER',
  name: 'John',
  birthdate: '20.11.88',
};

export const update_user_dto = {
  name: 'Slava',
  birthdate: '20.11.90',
};

export const invalid_update_user_dto = {
  name: 3773,
  birthdate: '',
};

export const updated_user_response = {
  id: 'df229c80-7432-4951-9f21-a1c5f803a738',
  email: 'Desoul40@mail.ru',
  password: bcrypt.hash(generator.generateString(12), 5),
  role: 'USER',
  name: 'Slava',
  birthdate: '20.11.90',
};

export const login_user_dto = {
  email: 'Desoul40@mail.ru',
  password: generator.generateString(12)
}

export const uniexisting_user_id = 'df229c80-7432-4951-9f21-a1c5f803a333';
