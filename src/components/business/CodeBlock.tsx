export default function CodeBlock(props: { children?: React.ReactNode }) {
  return (
    <pre className="text-wrap bg-gray-100 p-2 rounded-md">
      <code className=" text-gray-800">{props.children}</code>
    </pre>
  );
}
