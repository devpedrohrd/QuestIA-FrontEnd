'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const role = searchParams.get('role');

        if (accessToken && refreshToken && role) {
            // Salva os tokens no localStorage
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('role', role)

            // Redireciona com base no papel do usuário
            if (role === 'professor') {
                router.push('/dashboard/teacher');
            } else {
                router.push('/dashboard/students');
            }
        } else {
            console.error('Tokens ou role não encontrados na URL');
            router.push('/');
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Autenticando usuário...</p>
        </div>
    );
}
