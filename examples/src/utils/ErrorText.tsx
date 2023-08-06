type Props = {
  error: string;
};

export const ErrorText: React.FC<Props> = ({ error }) => {
  return <div className="error">{error}</div>;
};
