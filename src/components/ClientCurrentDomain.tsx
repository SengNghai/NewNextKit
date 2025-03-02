import { useCurrentDomain } from '~/hooks/useCurrentDomain'; // 根据你的文件结构调整路径

const ClientCurrentDomain = () => {
  const currentDomain = useCurrentDomain();

  return (
    <div>
      <h1>当前域名是: {currentDomain}</h1>
    </div>
  );
};

export default ClientCurrentDomain;
