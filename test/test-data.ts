import { generateString } from '../src/utils/generators.utils';

//const passwordGenerated = generateString(12);
const userPasswordHashed = generateString(12);

export const createUserDto = {
  email: 'Desoul40@mail.ru',
  password: userPasswordHashed,
  name: 'John',
  birthdate: '20.11.88',
};
