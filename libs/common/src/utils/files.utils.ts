import { extname } from 'path';

interface MulterFile {
  originalname: string;
  [key: string]: any;
}

export const imageFileFilter = (
  req: any,
  file: MulterFile,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const imageExtRegex = /\.(jpg|jpeg|png|gif)$/;
  if (!imageExtRegex.exec(file.originalname)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const editFileName = (
  req: any,
  file: MulterFile,
  callback: (error: Error | null, filename: string) => void,
) => {
  const fileExtName = extname(file.originalname);
  const dateName = new Date().getTime();
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  const result = randomName.toUpperCase();
  callback(null, `${dateName}${result}${fileExtName}`);
};
