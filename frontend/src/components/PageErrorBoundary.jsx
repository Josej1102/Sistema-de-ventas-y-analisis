import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class PageErrorBoundary extends Component {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Ocurrió un error inesperado en esta pantalla.',
    };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="page-state error-state">
        <AlertTriangle size={32} />
        <strong>Esta pantalla encontró un error</strong>
        <span>{this.state.message}</span>
        <button
          className="secondary-btn"
          onClick={() => this.setState({ hasError: false, message: '' })}
        >
          Volver a intentar
        </button>
      </div>
    );
  }
}
