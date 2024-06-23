export const handleKeyPress = (buttonElement) => (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    buttonElement.click();
  }
};

export const sendCommentsByEnter = ({
  buttonElement,
  nameInputElement,
  commentElement,
}) => {
  const handler = handleKeyPress(buttonElement);
  nameInputElement.addEventListener("keypress", handler);
  commentElement.addEventListener("keypress", handler);
};
