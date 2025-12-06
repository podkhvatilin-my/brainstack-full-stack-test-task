const API_URL = import.meta.env.VITE_API_URL;

export const uploadImage = async (dataUrl: string): Promise<{ id: string }> => {
  const blob = await fetch(dataUrl).then((res) => res.blob());
  const formData = new FormData();

  formData.append("file", blob, "photo.png");

  const response = await fetch(`${API_URL}/images`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  return response.json();
};

export const getImageUrl = (id: string): string => {
  return `${API_URL}/images/${id}`;
};
