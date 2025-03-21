'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { API_URL, FRONTEND_URL } from '../../utils/utils';
import api from '../../services/api';

type Quiz = {
  id: string;
  titulo: string;
  tema: string;
  nivelDificuldade: string;
  quantidade: number;
  tipoPergunta: string;
  link: string;
};

type Alternative = {
  letra: string;
  texto: string;
};

type Question = {
  id?: string; // Opcional, pois pode ainda não estar salvo no banco
  quizId?: string; // Opcional, pois só será definido após o salvamento
  pergunta: string;
  tipo: 'multipla_escolha' | 'verdadeiro_falso';
  alternativas?: Alternative[]; // Opcional para questões de verdadeiro ou falso
  respostaCorreta: string;
  explicacao?: string; // Opcional
};


export default function TeacherDashboard() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    difficulty: 'medio',
    questionCount: 10,
    questionType: 'multipla_escolha',
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);


  const [isEditing, setIsEditing] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);


  // 🔹 Fetch os quizzes do professor logado
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const response = await api.get<Quiz[]>('/quizzes');
        setQuizzes(response.data);
      } catch (error) {
        console.error('Erro ao carregar quizzes:', error);
        toast.error('Erro ao carregar os quizzes.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();

  }, []);

  // 🔹 Criar novo quiz
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const quizData = {
        titulo: formData.title,
        tema: formData.topic,
        nivelDificuldade: formData.difficulty,
        quantidade: formData.questionCount,
        tipoPergunta: formData.questionType,
      };

      const response = await api.post('/quizzes', quizData);
      const newQuiz = response.data;

      setQuizzes([...quizzes, newQuiz]);
      toast.success('Quiz criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar quiz:', error);
      toast.error('Erro ao criar quiz.');
    }
  };


  // 🔹 Gerar questões para um quiz
  const generateQuestions = async (quizId: string) => {
    try {
      const response = await api.post(`/questions/${quizId}`);
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        setGeneratedQuestions([...data]);
        setCurrentQuizId(quizId);
        setIsEditing(true);
      } else {
        toast.error("Nenhuma questão foi gerada.");
      }
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
      toast.error('Erro ao gerar questões.');
    }
  };


  // 🔹 Salvar questões geradas
  const saveQuestions = async (quizId: string) => {
    try {
      await api.post(`/questions/save/${quizId}`, generatedQuestions);
      toast.success('Questões salvas com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar questões:', error);
      toast.error('Erro ao salvar questões.');
    }
  };


  // 🔹 Deletar quiz
  const deleteQuiz = async (quizId: string) => {
    try {
      await api.delete(`/quizzes/${quizId}`);
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
      toast.success('Quiz deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar quiz:', error);
      toast.error('Erro ao deletar quiz.');
    }
  };


  // 🔹 Ver ranking
  const fetchRanking = (quizId: string) => {
    router.push(`/dashboard/teacher/ranking/${quizId}`);
  };

  // 🔹 Redirecionar para a página de perguntas do quiz
  const viewQuestions = (quizId: string) => {
    router.push(`${FRONTEND_URL}/questions/${quizId}`);
  };

  // 🔹 Copiar link do quiz para a área de transferência
  const copyLink = (quizId: string) => {
    const link = `${FRONTEND_URL}/questions/${quizId}`

    navigator.clipboard.writeText(link)
    toast.success('Link copiado para a área de transferência!');
  };

  return (
    <div className="container py-10">
      {/* 🔹 Card para criar quiz */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label>Título do Quiz</label>
              <Input
                name="title"
                placeholder="Digite o título do quiz"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label>Tópico</label>
              <Input
                name="topic"
                placeholder="Digite o tópico do quiz"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
            <div>
              <label>Nível de Dificuldade</label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Número de Perguntas</label>
              <Input
                type="number"
                name="questionCount"
                min={1}
                max={50}
                value={formData.questionCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    questionCount: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label>Tipo de Pergunta</label>
              <Select
                value={formData.questionType}
                onValueChange={(value) => setFormData({ ...formData, questionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de pergunta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                  <SelectItem value="verdadeiro_falso">Verdadeiro ou Falso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Criar Quiz
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 🔹 Lista de quizzes do professor */}
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Meus Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando quizzes...</p>
            ) : quizzes.length === 0 ? (
              <p>Nenhum quiz encontrado.</p>
            ) : (
              <ul className="space-y-4">
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold">{quiz.titulo}</p>
                      <p className="text-sm text-gray-600">{quiz.tema} - {quiz.nivelDificuldade}</p>
                    </div>
                    <div className="space-x-2">
                      <Button onClick={() => generateQuestions(quiz.id)}>Gerar Questões</Button>
                      <Button variant="secondary" onClick={() => viewQuestions(quiz.id)}>
                        Ver Perguntas
                      </Button>
                      <Button variant="outline" onClick={() => copyLink(quiz.link)}>
                        Copiar Link
                      </Button>
                      <Button variant="destructive" onClick={() => deleteQuiz(quiz.id)}>
                        Deletar Quiz
                      </Button>
                      <Button variant="default" onClick={() => fetchRanking(quiz.id)}>
                        Ranking
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>


      {/* 🔹 Modal de edição das questões */}
      {isEditing && generatedQuestions.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-2/3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Editar Questões</h2>

            <div className="space-y-4">
              {generatedQuestions.map((question, index) => (
                <div key={index} className="space-y-4 border p-4 rounded-lg">
                  <label className="block font-semibold">Pergunta</label>
                  <Input
                    value={question?.pergunta || ''}
                    onChange={(e) => {
                      const updatedQuestions = [...generatedQuestions];
                      updatedQuestions[index].pergunta = e.target.value;
                      setGeneratedQuestions([...updatedQuestions]);
                    }}
                  />

                  {question?.tipo === "multipla_escolha" && Array.isArray(question.alternativas) && (
                    <div>
                      <label className="block font-semibold">Alternativas</label>
                      {question.alternativas.map((alt, altIndex) => (
                        <div key={altIndex} className="flex gap-2 items-center">
                          <Input
                            value={alt.texto || ''}
                            onChange={(e) => {
                              const updatedQuestions = [...generatedQuestions];
                              updatedQuestions[index].alternativas![altIndex].texto = e.target.value;
                              setGeneratedQuestions([...updatedQuestions]);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="block font-semibold">Resposta Correta</label>
                  <Input
                    value={question?.respostaCorreta || ''}
                    onChange={(e) => {
                      const updatedQuestions = [...generatedQuestions];
                      updatedQuestions[index].respostaCorreta = e.target.value;
                      setGeneratedQuestions([...updatedQuestions]);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={() => saveQuestions(currentQuizId!)}>
                Salvar Questões
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

}
