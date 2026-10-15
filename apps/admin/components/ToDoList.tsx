"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Todo = {
  id: number;
  title: string;
  is_done: boolean;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  async function getTodos() {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setTodos(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    getTodos();
  }, []);

  async function addTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) return;

    const { error } = await supabase
      .from("todos")
      .insert({ title: title.trim() });

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    await getTodos();
  }

  async function toggleTodo(todo: Todo) {
    const { error } = await supabase
      .from("todos")
      .update({ is_done: !todo.is_done })
      .eq("id", todo.id);

    if (error) {
      alert(error.message);
      return;
    }

    await getTodos();
  }

  async function deleteTodo(id: number) {
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await getTodos();
  }

  const completed = todos.filter((todo) => todo.is_done).length;
  const progress = todos.length
    ? (completed / todos.length) * 100
    : 0;

  return (
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Form tambah tugas */}
        <form onSubmit={addTodo} className="mb-8 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Apa yang ingin dikerjakan?"
            aria-label="Nama tugas"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95"
          >+</button>
        </form>

        {/* Judul daftar */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Daftar Tugas</h2>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
            {todos.length} tugas
          </span>
        </div>

        {/* Daftar tugas */}
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Memuat tugas...
          </p>
        ) : todos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
            <p className="text-sm text-slate-500">
              Belum ada tugas.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tambahkan tugas pertamamu di atas.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between gap-3 py-4"
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.is_done}
                    onChange={() => toggleTodo(todo)}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                  />

                  <span
                    className={`break-words text-sm ${
                      todo.is_done
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                    }`}
                  >
                    {todo.title}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Hapus ${todo.title}`}
                  className="shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Progress */}
        <footer className="mt-6 border-t border-slate-100 pt-5">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Progress tugas</span>
            <span>
              {completed} dari {todos.length} selesai
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </footer>
      </section>
  );
}