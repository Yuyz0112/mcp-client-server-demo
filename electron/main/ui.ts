import { BrowserWindow, ipcMain } from "electron";
import { v4 } from "uuid";

type ConfirmRequest<T> = {
  type: string;
  payload: T;
};
type ConfirmResponse<U> = {
  id: string;
  ok: boolean;
  payload: U;
};

const USER_CONFIRM_REQUEST = `user-confirm-request`;
const USER_CONFIRM_RESPONSE = `user-confirm-response`;

export function userConfirm<T, U>(payload: ConfirmRequest<T>) {
  const confirmId = v4();

  return new Promise<U>((resolve, reject) => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    mainWindow.webContents.send(USER_CONFIRM_REQUEST, {
      ...payload,
      id: confirmId,
    });

    const handler = (_: unknown, { id, ok, payload }: ConfirmResponse<U>) => {
      if (confirmId !== id) {
        return;
      }

      if (ok === true) {
        resolve(payload);
      } else {
        reject(new Error("User canceled"));
      }

      ipcMain.removeListener(USER_CONFIRM_RESPONSE, handler);
    };

    ipcMain.addListener(USER_CONFIRM_RESPONSE, handler);
  });
}
