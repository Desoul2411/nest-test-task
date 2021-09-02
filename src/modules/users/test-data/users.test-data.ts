import { generateString } from "../../../utils/generators.utils";

export const user_id = "df229c80-7432-4951-9f21-a1c5f803a738";
export const email = "Desoul40@mail.ru";

export const create_user_dto = {
  email: "Desoul40@mail.ru",
  password: generateString(12),
  name: "slava",
  birthdate: "20.11.1988",
};

export const create_user_result = {
  id: "df229c80-7432-4951-9f21-a1c5f803a738",
  email: "Desoul40@mail.ru",
  password: generateString(12),
  role: "USER",
  name: "slava",
  birthdate: "20.11.1988",
};

export const update_user_dto = {
  name: "John",
  birthdate: "20.11.1995",
};

export const update_user_result = {
  id: "df229c80-7432-4951-9f21-a1c5f803a738",
  email: "Desoul40@mail.ru",
  password: generateString(12),
  role: "USER",
  name: "John",
  birthdate: "20.11.1995",
};

export const get_all_users_result = [
  {
    id: "df229c80-7432-4951-9f21-a1c5f803a738",
    email: "Desoul40@mail.ru",
    password: generateString(12),
    role: "USER",
    name: "John",
    birthdate: "20.11.1995",
  },
  {
    id: "df229c80-7432-4951-9f21-a1c5f803a739",
    email: "Jack25@mail.ru",
    password: generateString(12),
    role: "USER",
    name: "Jack",
    birthdate: "14.11.1990",
  },
];

export const delete_user_result = {
  email: "Desoul40@mail.ru",
  password: generateString(12),
  role: "USER",
  name: "slava",
  birthdate: "20.11.1988",
};

export const find_one_expected_result = {
  email: "Desoul40@mail.ru",
  password: generateString(12),
  role: "USER",
  name: "slava",
  birthdate: "20.11.1988",
  id: "df229c80-7432-4951-9f21-a1c5f803a738",
};
