import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Simulate slight network delay for feel
        setTimeout(() => {
            const success = login(username, password);
            if (!success) {
                setError('Usuário ou senha incorretos. Tente novamente.');
            }
            setIsSubmitting(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg border-muted/60">
                <CardHeader className="space-y-4 flex flex-col items-center justify-center pt-8 pb-4">
                    <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
                        <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center space-y-1">
                        <CardTitle className="text-2xl font-bold">Healthmais</CardTitle>
                        <CardDescription className="text-sm font-medium">Dashboard de Power BI - Acesso Restrito</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="username">
                                Usuário
                            </label>
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                required
                                disabled={isSubmitting}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Ex: rai.oliveira"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                disabled={isSubmitting}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Sua senha de acesso"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm font-medium text-center shadow-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || !username || !password}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-primary-foreground hover:bg-blue-600/90 h-10 px-4 py-2 w-full shadow hover:shadow-md"
                        >
                            {isSubmitting ? 'Autenticando...' : 'Entrar no Dashboard'}
                        </button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <p className="text-xs text-muted-foreground">Sistema de uso exclusivo PBI Atendimento Domiciliar</p>
                </CardFooter>
            </Card>
        </div>
    );
}
