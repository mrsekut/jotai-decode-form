type Props = {
  value: unknown;
};

export const DisplayInternalValue: React.FC<Props> = ({ value }) => {
  return (
    <div className="display_internal_values">
      <div>value: {JSON.stringify(value)}</div>
      <div>type: {typeof value}</div>
    </div>
  );
};
