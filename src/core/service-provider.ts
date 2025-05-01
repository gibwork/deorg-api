import { ModuleMetadata, Provider } from '@nestjs/common';

export class ServiceProvider {
  protected providers: Provider[] = [];
  protected controllers: any[] = [];
  protected imports: any[] = [];
  protected exports: any[] = [];

  static buildByProviders(providers: ModuleMetadata[]) {
    const serviceProvider = new ServiceProvider();
    serviceProvider.joinProviders(providers);
    return serviceProvider;
  }

  addProvider(provider: Provider) {
    this.providers.push(provider);
  }

  addController(controller: any) {
    this.controllers.push(controller);
  }

  addImport(dependencie: any) {
    this.imports.push(dependencie);
  }

  addExport(dependencies: Provider[]) {
    this.exports.push(...dependencies);
  }

  joinProviders(serviceProviders: ModuleMetadata[]) {
    serviceProviders.forEach((serviceProvider) =>
      this.joinProvider(serviceProvider),
    );
  }

  joinProvider({ controllers, providers, imports }: ModuleMetadata) {
    controllers?.forEach((item) => this.addController(item));
    providers?.forEach((item) => this.addProvider(item));
    imports?.forEach((item) => this.addImport(item));
  }

  getModule(): ModuleMetadata {
    return {
      imports: this.imports,
      controllers: this.controllers,
      providers: this.providers,
      exports: this.exports,
    };
  }
}
