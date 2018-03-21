export default function(c) {

  class Component {
    constructor(_container, _state) {
      this.container = _container;
      this.state = _state;
      this.container.on('open', () => c.setup(this.container.getElement()[0]));
      this.container.on('resize', () => this.setSize());
      this.container.on('destroy', () => console.log('destroy'));
    }

    setSize() {
      if (c.hasOwnProperty('set_size'))
        c.set_size(this.container.width, this.container.height);
    }
  }

  return Component;
}
