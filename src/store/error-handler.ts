const errorHandler = (error: Error, actionName: string): void => {
  console.log('Action name:', actionName); // eslint-disable-line no-console
  console.log('Error stack:', error); // eslint-disable-line no-console
};

export default errorHandler;
