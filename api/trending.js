export default async function handler(req, res) {

  const phones = [
    {
      name: "Samsung Galaxy S26",
      camera: "200MP Camera",
      battery: "5000mAh",
      display: "120Hz AMOLED",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
    },
    {
      name: "iPhone 16",
      camera: "48MP Camera",
      battery: "4200mAh",
      display: "OLED Display",
      image: "https://images.unsplash.com/photo-1512499617640-c2f999018b72"
    },
    {
      name: "Xiaomi 17 Ultra",
      camera: "200MP Leica Camera",
      battery: "5200mAh",
      display: "144Hz AMOLED",
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505"
    }
  ];

  res.status(200).json({ phones });

}
