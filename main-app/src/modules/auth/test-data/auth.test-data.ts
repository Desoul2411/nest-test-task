import { Generator as generator }  from "../../../utils/generator.utils";
import * as bcrypt from "bcrypt";

export const token_response = { token: generator.generateString(212) };

export const login_user_data = {
  email: "Desoul40@mail.ru",
  password: generator.generateString(12),
};

export const user_data = {
  email: "Desoul40@mail.ru",
  password: bcrypt.hash(generator.generateString(12), 5),
  role: "USER",
  name: "slava",
  birthdate: "20.11.1988",
  id: "df229c80-7432-4951-9f21-a1c5f803a738",
};

export const user_data_to_token = {
  userId: "df229c80-7432-4951-9f21-a1c5f803a738",
  role: "USER",
};

export const register_user_data = {
  email: "Desoul40@mail.ru",
  password: generator.generateString(12),
  name: "slava",
  birthdate: "20.11.1988",
};

export const create_user_result = {
  email: "Desoul40@mail.ru",
  password: bcrypt.hash(generator.generateString(12), 5),
  role: "USER",
  name: "slava",
  birthdate: "20.11.1988",
  id: "df229c80-7432-4951-9f21-a1c5f803a738",
};

export const token_value = generator.generateString(12);
export const user_email = "Desoul40@mail.ru";
