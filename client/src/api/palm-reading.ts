const API_URL = import.meta.env.VITE_API_URL;

export const startPalmReading = async (dataUrl: string): Promise<{ jobId: string }> => {
  const blob = await fetch(dataUrl).then((res) => res.blob());
  const formData = new FormData();

  formData.append("file", blob, "photo.png");

  const response = await fetch(`${API_URL}/palm-reading/start`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to start palm reading");
  }

  return response.json();
};

export const subscribeToPalmReadingProgress = (
  jobId: string,
  onProgress: (job: any) => void,
  onError: (error: Error) => void
): (() => void) => {
  const eventSource = new EventSource(`${API_URL}/palm-reading/progress/${jobId}`);

  eventSource.onmessage = (event) => {
    try {
      const job = JSON.parse(event.data);
      onProgress(job);

      // Close connection when job is done
      if (job.status === "completed" || job.status === "failed") {
        eventSource.close();
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error("Failed to parse progress data"));
      eventSource.close();
    }
  };

  eventSource.onerror = () => {
    onError(new Error("Connection to server lost"));
    eventSource.close();
  };

  // Return cleanup function
  return () => eventSource.close();
};

export const getImageUrl = (id: string): string => {
  return `${API_URL}/images/${id}`;
};
