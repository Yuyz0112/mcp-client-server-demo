import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  `https://xasgqzteakyjyjnumosb.supabase.co`,
  process.env.VITE_APP_SUPABASE_KEY || ""
);

export type News = {
  id: number;
  title: string;
  url: string;
  content: string;
  created_at: string;
  draft: boolean;
  tags: string[];
};

export const db = {
  async listNews(): Promise<News[]> {
    const { data } = await supabase
      .from("news")
      .select()
      .order("created_at", { ascending: false });
    return data || [];
  },
  async getNews(id: number): Promise<News | null> {
    const { data } = await supabase.from("news").select().eq("id", id).single();
    return data || null;
  },
  async updateNews(news: News): Promise<News> {
    const { data } = await supabase
      .from("news")
      .update(news)
      .eq("id", news.id)
      .select()
      .single();
    return data;
  },
  async deleteNews(id: number): Promise<void> {
    await supabase.from("news").delete().eq("id", id);
  },
};
