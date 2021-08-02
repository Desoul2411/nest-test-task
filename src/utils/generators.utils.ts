export const generateString = (length: number): string => {
  const chrs = "$2b$05$dUntHHUjaS0EcuNvncE8huSgz7WYRDx79lRnVP5AQI51qG2O39tqO";
  let str = "";
  for (let i = 0; i < length; i++) {
    const pos = Math.floor(Math.random() * chrs.length);
    str += chrs.substring(pos, pos + 1);
  }
  return str;
};

export const generateRandomNumber = (min: number, max: number): number => {
  const randomNumber = Math.floor(Math.random() * (max - min)) + min;
  return randomNumber;
};
