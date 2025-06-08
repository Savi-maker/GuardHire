import { Request, Response } from 'express';
import { db } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'twoj_tajny_klucz';

export const register = async (req: Request, res: Response) => {
    const {
        username,
        mail,
        haslo,
        imie = '',
        nazwisko = '',
        numertelefonu = '',
        stanowisko = 'Pracownik',
        role = 'user'
    } = req.body;

    if (!username || !mail || !haslo) {
        return res.status(400).json({
            success: false,
            error: 'Wszystkie wymagane pola muszą być wypełnione'
        });
    }

    db.get(
        'SELECT * FROM profiles WHERE username = ? OR mail = ?',
        [username, mail],
        async (err, existingUser) => {
            if (err) {
                console.error('Błąd bazy danych:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Błąd serwera podczas sprawdzania użytkownika'
                });
            }

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Użytkownik o podanej nazwie lub adresie email już istnieje'
                });
            }

            try {
                const hashedPassword = await bcrypt.hash(haslo, 10);

                db.run(
                    `INSERT INTO profiles (
            username, mail, haslo, role, 
            imie, nazwisko, numertelefonu, stanowisko
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        username,
                        mail,
                        hashedPassword,
                        role,
                        imie,
                        nazwisko,
                        numertelefonu,
                        stanowisko
                    ],
                    function(err) {
                        if (err) {
                            console.error('Błąd podczas dodawania użytkownika:', err);
                            return res.status(500).json({
                                success: false,
                                error: 'Błąd podczas tworzenia użytkownika'
                            });
                        }

                        const token = jwt.sign(
                            {
                                userId: this.lastID,
                                username: username,
                                role: role
                            },
                            JWT_SECRET,
                            { expiresIn: '24h' }
                        );

                        res.status(201).json({
                            success: true,
                            message: 'Użytkownik został zarejestrowany',
                            token
                        });
                    }
                );
            } catch (error) {
                console.error('Błąd podczas przetwarzania rejestracji:', error);
                res.status(500).json({
                    success: false,
                    error: 'Wystąpił błąd podczas rejestracji'
                });
            }
        }
    );
};