export type CartData = {
  product_image:string;
  price:string;
  name:string;
  productId:number;
  quantity:number;
}

export type Wishlist = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  slug: string;
  created_at: string;
  updated_at: string;
  favorite :boolean;
}

export type Cart = {
  user_email: string;
  user_name:string;
  cart: [];
  id: string;
  wishlist:[]
};
