import { Injectable } from '@angular/core';
import * as AES from 'crypto-js/aes';
import * as Utf8 from 'crypto-js/enc-utf8';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  /**
   * secret key for encrypion and decryption
   */
  private secretKey = '@G2346%#vb6';

  /**
   * handle encryption
   *
   * @param data data to be encrypt
   * @returns ciphertext
   */
  encrypt(data: string): string {
    const ciphertext = AES.encrypt(data, this.secretKey).toString();
    return ciphertext;
  }

  /**
   * Handle Decryption
   *
   * @param ciphertext text to be decrypt
   * @returns original data
   */
  decrypt(ciphertext: string): string {
    const bytes = AES.decrypt(ciphertext, this.secretKey);
    const originalText = bytes.toString(Utf8);
    return originalText;
  }
}
