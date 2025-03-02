import { useReducer, useEffect } from 'react';

// 定义全局数据的初始状态和类型
interface GlobalData {
  someField: string;
  anotherField: number;
  // 根据实际数据结构添加更多字段
}

interface GlobalDataState {
  data: GlobalData | null;
}

interface Action {
  type: 'SET_GLOBAL_DATA';
  payload: GlobalData;
}

const initialState: GlobalDataState = {
  data: null,
};

const globalDataReducer = (state: GlobalDataState, action: Action): GlobalDataState => {
  switch (action.type) {
    case 'SET_GLOBAL_DATA':
      return { ...state, data: action.payload };
    default:
      return state;
  }
};

// 自定义 Hook
const useServiceWorkerData = () => {
  const [state, dispatch] = useReducer(globalDataReducer, initialState);

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'GLOBAL_DATA_UPDATE' || event.data.type === 'GLOBAL_DATA_INITIALIZE')) {
        const globalData: GlobalData = event.data.data;
        console.log("Received global data:", globalData);
        dispatch({ type: 'SET_GLOBAL_DATA', payload: globalData });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  return state.data;
};

export default useServiceWorkerData;
