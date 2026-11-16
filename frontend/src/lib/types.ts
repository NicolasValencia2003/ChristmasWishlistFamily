export interface PersonSummary {
  id: string;
  name: string;
  createdAt: string;
  giftCount: number;
}

export interface Gift {
  id: string;
  personId: string;
  name: string;
  url: string | null;
  store: string | null;
  createdAt: string;
}

export interface PersonWithGifts {
  id: string;
  name: string;
  createdAt: string;
  gifts: Gift[];
}

export interface CreatedGift extends Gift {
  person: { id: string; name: string };
}
