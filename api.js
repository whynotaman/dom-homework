export const getComments = ({ comments }) => {
  return fetch("https://wedev-api.sky.pro/api/v1/aman/comments", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) throw new Error("Нет ответа от сервера");
      return response.json();
    })
    .then((responseData) => {
      comments = responseData.comments;
      return comments;
    });
};

export const postComments = ({name, text}) => {
  return fetch("https://wedev-api.sky.pro/api/v1/aman/comments", {
    method: "POST",
    body: JSON.stringify({
      name: name,
      text: text,
      forceError: false,
    }),
  }).then((response) => {
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("400: Некорректный запрос");
      } else if (response.status === 500) {
        throw new Error("500: Внутренняя ошибка сервера");
      } else {
        throw new Error("Нет ответа от сервера");
      }
    }
    return response.json();
  });
};
