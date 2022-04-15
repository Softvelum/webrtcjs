export default class Logger {

  constructor(logLevel)
	{
    this.logLevel = logLevel;
	}

  info() {
    if ('info' == this.logLevel) {
      console['info'].apply( this, arguments );
    }
  }

  error(msg) { console['error'].apply( this, arguments ); }

}
