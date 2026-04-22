import Image from "next/image";
import Link from "next/link";

export default function Login() {
  return (
    <main className="min-h-screen bg-[#0f0f17] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md text-center">

        <div className="inline-flex items-center gap-2 bg-[#1a1a2e] text-[#7c6af7] text-xs px-4 py-1 rounded-full border border-[#3d3560] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-pulse"></span>
          Conecte sua conta
        </div>

        <h1 className="text-3xl md:text-4xl font-medium mb-4">
          Entrar no <span className="text-[#7c6af7]">UndeadGame</span>
        </h1>

        <p className="text-gray-400 mb-8">
          Conecte sua conta da Steam para importar seus jogos e começar a transformar seu backlog em metas.
        </p>

        <div className="bg-[#1a1a2e] border border-[#2a2a3a] rounded-2xl p-6">

          <Link href="/api/auth/steam" className="w-full flex items-center justify-center gap-3 bg-[#1b2838] text-[#c7d5e0] px-6 py-3 rounded-xl border border-[#4a6fa5] hover:bg-[#243447] hover:border-[#6a9fd8] transition">

            <Image src="/Steam_Logo.png" alt="Steam Icon" width={30} height={30} />


            Entrar com Steam
          </Link>

          <p className="text-xs text-gray-500 mt-4">
            Usamos apenas dados públicos da sua conta.
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Funciona apenas com perfis públicos da Steam.
        </p>

        <Link href="/" className="inline-block mt-6 text-sm text-[#7c6af7] hover:underline">
          ← Voltar para início
        </Link>

      </div>
    </main>
  );
}