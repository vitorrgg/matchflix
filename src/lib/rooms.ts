import { supabase, getUserId } from "./supabase";
import type { Room, RoomParticipant, Swipe, SwipeDirection } from "@/types";

// Generate a short 6-char room code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(): Promise<Room> {
  const code = generateCode();
  const { data, error } = await supabase
    .from("rooms")
    .insert({ code })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Room;
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  const { data } = await supabase
    .from("rooms")
    .select()
    .eq("code", code.toUpperCase())
    .single();

  return (data as Room) ?? null;
}

export async function joinRoom(roomId: string, nickname: string): Promise<RoomParticipant> {
  const userId = getUserId();

  const { data, error } = await supabase
    .from("room_participants")
    .upsert(
      { room_id: roomId, user_id: userId, nickname },
      { onConflict: "room_id,user_id" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as RoomParticipant;
}

export async function getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
  const { data } = await supabase
    .from("room_participants")
    .select()
    .eq("room_id", roomId)
    .order("joined_at");

  return (data as RoomParticipant[]) ?? [];
}

export async function recordSwipe(
  roomId: string,
  movieId: number,
  direction: SwipeDirection,
): Promise<void> {
  const userId = getUserId();

  const { error } = await supabase.from("swipes").upsert(
    {
      room_id: roomId,
      user_id: userId,
      movie_id: movieId,
      direction,
    },
    { onConflict: "room_id,user_id,movie_id" },
  );

  if (error) throw new Error(error.message);
}

export async function checkMatch(
  roomId: string,
  movieId: number,
): Promise<boolean> {
  // Count participants in the room
  const { count: participantCount } = await supabase
    .from("room_participants")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId);

  // Count "right" swipes for this movie in this room
  const { count: likeCount } = await supabase
    .from("swipes")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId)
    .eq("movie_id", movieId)
    .eq("direction", "right");

  return (
    participantCount !== null &&
    likeCount !== null &&
    participantCount > 0 &&
    likeCount >= participantCount
  );
}

export async function getRoomSwipes(roomId: string): Promise<Swipe[]> {
  const { data } = await supabase
    .from("swipes")
    .select()
    .eq("room_id", roomId)
    .eq("direction", "right")
    .order("created_at");

  return (data as Swipe[]) ?? [];
}

export function getShareUrl(code: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}?room=${code}`;
}
