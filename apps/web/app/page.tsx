
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <header className="py-4 px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">SupportingBases</div>
          <nav className="space-x-6 flex items-center">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Funcionalidades
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              Como Funciona
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Começar Agora
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-8 py-20 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 text-left mb-10 md:mb-0">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                De Dados Brutos à Decisões Brilhantes.
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A SupportingBases traduz a complexidade dos seus dados financeiros em um diagnóstico claro e um plano de ação estratégico. Tenha a clareza que você precisa para construir um futuro financeiro sólido e antifrágil.
              </p>
              <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg hover:bg-blue-700">
                Crie sua Análise Gratuita
              </Link>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/assets/hero-image.png"
                alt="Dashboard da SupportingBases em um laptop"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900">
                Entenda o Coração da sua Estrutura Financeira
              </h2>
              <p className="text-lg text-gray-600 mt-4">
                Nossa análise vai além do superficial. Focamos em métricas que revelam a verdadeira saúde e resiliência do seu sistema financeiro.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <Image
                  src="/assets/icon-diagnostico.svg"
                  alt="Ícone de Diagnóstico"
                  width={64}
                  height={64}
                  className="mx-auto mb-4"
                />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Diagnóstico Estrutural</h3>
                <p className="text-gray-600">
                  Calculamos seu Índice de Cobertura Financeira (ICF) e Margem de Sobrevivência (MSD) para revelar a pressão sobre sua estrutura.
                </p>
              </div>
              <div className="text-center">
                <Image
                  src="/assets/icon-plano.svg"
                  alt="Ícone de Plano de Ação"
                  width={64}
                  height={64}
                  className="mx-auto mb-4"
                />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Plano de Ação Inteligente</h3>
                <p className="text-gray-600">
                  Baseado no seu diagnóstico, geramos um plano com as ações prioritárias para você fortalecer sua base e alcançar o próximo nível.
                </p>
              </div>
              <div className="text-center">
                <Image
                  src="/assets/icon-futuro.svg"
                  alt="Ícone de Visão de Futuro"
                  width={64}
                  height={64}
                  className="mx-auto mb-4"
                />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Visão de Longo Prazo</h3>
                <p className="text-gray-600">
                  Saia do modo '''apagar incêndios'''. Nossa plataforma te dá a tranquilidade e a clareza para focar no crescimento e na perpetuidade.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900">Comece em Menos de 5 Minutos</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Crie sua Conta</h3>
                <p className="text-gray-600">O registro é rápido, seguro e gratuito. Seus dados são protegidos.</p>
              </div>
              <div className="text-4xl text-gray-400">&rarr;</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Configure seu Perfil</h3>
                <p className="text-gray-600">
                  Selecione seu perfil (Pessoa Física, Autônomo ou Empresa) e preencha seus dados estruturais.
                </p>
              </div>
              <div className="text-4xl text-gray-400">&rarr;</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Receba seu Diagnóstico</h3>
                <p className="text-gray-600">
                  Adicione suas receitas e despesas para nossa IA analisar sua estrutura e gerar seu plano de ação.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; 2024 SupportingBases. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
