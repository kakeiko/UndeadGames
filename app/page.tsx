import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {

  const cookieStore = await cookies();
  if (cookieStore.has("steamid")) {
    return redirect("/dashboard"); 
  }

  return (
    <main className="bg-[#0f0f17] text-white font-sans">

      <section className="text-center py-20 px-6 max-w-3xl mx-auto animate-fade-up animate-duration-500 animate-ease-in animate-delay-100">

        <div className="inline-flex items-center gap-2 bg-[#1a1a2e] text-[#7c6af7] text-xs px-4 py-1 rounded-full border border-[#3d3560] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-pulse"></span>
          Seu backlog tem solução
        </div>

        <h1 className="text-4xl md:text-6xl font-medium leading-tight mb-5">
          Reviva seus jogos mortos <br />
          com o <span className="text-[#7c6af7]">UndeadGame</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Aquele jogo que você comprou e nunca abriu? Nós transformamos seu backlog em metas, desafios e recompensas.
        </p>

        <Link href="/login" className="flex items-center gap-2 mx-auto w-45 bg-[#1b2838] text-[#c7d5e0] px-6 py-3 rounded-xl border border-[#4a6fa5] hover:bg-[#243447] hover:border-[#6a9fd8] transition">
          Entrar com Steam
        </Link>

      </section>

      <div className="border-t border-[#2a2a3a] mx-6 animate-fade-up animate-duration-500 animate-ease-in animate-delay-300"></div>

      <section className="py-16 px-6 max-w-3xl mx-auto animate-fade-up animate-duration-500 animate-ease-in animate-delay-500">

        <p className="text-xs uppercase tracking-widest text-[#7c6af7] mb-2">
          Como funciona
        </p>

        <h2 className="text-2xl font-medium mb-12">
          Três passos para ressuscitar seu backlog
        </h2>

        <div className="flex flex-col gap-10">

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a2e] border border-[#3d3560] text-[#7c6af7]">
                1
              </div>
              <div className="w-1 flex-1 bg-[#2a2a3a] mt-2"></div>
            </div>

            <div>
              <h3 className="font-medium mb-1">
                Conecte sua conta da Steam
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Importamos automaticamente sua biblioteca de jogos.
              </p>

              <div className="bg-[#1a1a2e] p-4 rounded-lg flex items-center gap-3 border border-[#2a2a3a]">
                <div className="w-10 h-10 flex items-center justify-center bg-black rounded">
                  🎮
                </div>
                <div className="flex-1">
                  <p className="text-sm">147 jogos importados</p>
                  <p className="text-xs text-gray-500">Steam · agora</p>
                  <div className="h-1 bg-[#2a2a3a] rounded mt-2">
                    <div className="h-full bg-[#7c6af7] w-[60%] rounded"></div>
                  </div>
                </div>
                <span className="text-xs bg-[#1f1500] text-[#e8a045] px-2 py-1 rounded">
                  sincronizando
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0d1f17] border border-[#1a4d30] text-[#3fcf8e]">
                2
              </div>
              <div className="w-[1px] flex-1 bg-[#2a2a3a] mt-2"></div>
            </div>

            <div>
              <h3 className="font-medium mb-1">Crie metas simples</h3>
              <p className="text-sm text-gray-400 mb-3">
                Defina objetivos como jogar 2 horas ou desbloquear conquistas.
              </p>

              <div className="bg-[#1a1a2e] p-4 rounded-lg flex items-center gap-3 border border-[#2a2a3a]">
                <div className="w-10 h-10 flex items-center justify-center bg-black rounded">
                  🗡️
                </div>
                <div className="flex-1">
                  <p className="text-sm">Hollow Knight</p>
                  <p className="text-xs text-gray-500">Meta: 2h · 0h jogadas</p>
                </div>
                <span className="text-xs bg-[#1f1500] text-[#e8a045] px-2 py-1 rounded">
                  0%
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1f1500] border border-[#4d3000] text-[#e8a045]">
                3
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-1">Ganhe recompensas</h3>
              <p className="text-sm text-gray-400 mb-3">
                Complete metas e acumule pontos.
              </p>

              <div className="bg-[#1a1a2e] p-4 rounded-lg flex items-center gap-3 border border-[#2a2a3a]">
                <div className="w-10 h-10 flex items-center justify-center bg-black rounded">
                  🏆
                </div>
                <div className="flex-1">
                  <p className="text-sm">Stardew Valley</p>
                  <p className="text-xs text-gray-500">Meta concluída · 5h</p>
                  <div className="h-1 bg-[#2a2a3a] rounded mt-2">
                    <div className="h-full bg-[#3fcf8e] w-full rounded"></div>
                  </div>
                </div>
                <span className="text-xs bg-[#0d1f17] text-[#3fcf8e] px-2 py-1 rounded">
                  concluído
                </span>
              </div>

              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-[#1a1a2e] text-[#7c6af7] px-2 py-1 rounded">
                  +150 XP
                </span>
                <span className="text-xs bg-[#1f1500] text-[#e8a045] px-2 py-1 rounded">
                  +1 conquista
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="text-center py-12 border-t border-[#2a2a3a] animate-fade-up animate-duration-500 animate-ease-in animate-delay-800">
        <Link href="/login" className="flex items-center gap-2 mx-auto w-45 bg-[#1b2838] text-[#c7d5e0] px-6 py-3 rounded-xl border border-[#4a6fa5] hover:bg-[#243447] hover:border-[#6a9fd8] transition">
          Entrar com Steam
        </Link>
      </section>

    </main>
  );
}