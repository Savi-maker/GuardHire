import { Request, Response } from 'express';
import { db } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'twoj_tajny_klucz';

export const register = (req: Request, res: Response) => {
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
        res.status(400).json({
            success: false,
            error: 'Wszystkie wymagane pola muszą być wypełnione'
        });
        return;
    }

    db.get(
        'SELECT * FROM profiles WHERE username = ? OR mail = ?',
        [username, mail],
        (err, existingUser) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    error: 'Błąd serwera podczas sprawdzania użytkownika'
                });
                return;
            }

            if (existingUser) {
                res.status(400).json({
                    success: false,
                    error: 'Użytkownik o podanej nazwie lub adresie email już istnieje'
                });
                return;
            }

            // hashowanie i rejestracja
            bcrypt.hash(haslo, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    res.status(500).json({
                        success: false,
                        error: 'Błąd przy szyfrowaniu hasła'
                    });
                    return;
                }

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
                    function (err) {
                        if (err) {
                            res.status(500).json({
                                success: false,
                                error: 'Błąd podczas tworzenia użytkownika'
                            });
                            return;
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
            });
        }
    );
};

export const verifyUser = (req: Request, res: Response) => {
    const { mail, imie, nazwisko } = req.body;

    db.get(
        'SELECT * FROM profiles WHERE mail = ? AND imie = ? AND nazwisko = ?',
        [mail, imie, nazwisko],
        (err, user) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    message: 'Błąd serwera podczas weryfikacji'
                });
                return;
            }

            if (!user) {
                res.status(404).json({
                    success: false,
                    exists: false,
                    message: 'Użytkownik nie istnieje lub dane są nieprawidłowe'
                });
                return;
            }

            res.json({
                success: true,
                exists: true
            });
        }
    );
};

export const resetPassword = (req: Request, res: Response) => {
    const { mail, imie, nazwisko, newPassword } = req.body;

    if (!mail || !imie || !nazwisko || !newPassword) {
        res.status(400).json({
            success: false,
            error: 'Brak wymaganych danych'
        });
        return;
    }

    db.get(
        'SELECT * FROM profiles WHERE mail = ? AND imie = ? AND nazwisko = ?',
        [mail, imie, nazwisko],
        (err, user: any) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    error: 'Błąd serwera podczas weryfikacji'
                });
                return;
            }

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'Użytkownik nie istnieje lub dane są nieprawidłowe'
                });
                return;
            }

            bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    res.status(500).json({
                        success: false,
                        error: 'Błąd przy szyfrowaniu hasła'
                    });
                    return;
                }

                db.run(
                    'UPDATE profiles SET haslo = ? WHERE id = ?',
                    [hashedPassword, user.id],
                    function (err) {
                        if (err) {
                            res.status(500).json({
                                success: false,
                                error: 'Błąd podczas aktualizacji hasła'
                            });
                            return;
                        }

                        res.json({
                            success: true,
                            message: 'Hasło zostało zresetowane'
                        });
                    }
                );
            });
        }
    );
};
