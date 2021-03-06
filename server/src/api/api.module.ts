import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';

import { ConfigModule } from '../config/config.module';
import { DataImportModule } from '../data-import/data-import.module';
import { I18nModule } from '../i18n/i18n.module';
import { PluginModule } from '../plugin/plugin.module';
import { ServiceModule } from '../service/service.module';

import { IdCodecService } from './common/id-codec.service';
import { RequestContextService } from './common/request-context.service';
import { GraphqlConfigService } from './config/graphql-config.service';
import { AssetInterceptor } from './middleware/asset-interceptor';
import { AuthGuard } from './middleware/auth-guard';
import { IdInterceptor } from './middleware/id-interceptor';
import { AdministratorResolver } from './resolvers/administrator.resolver';
import { AssetResolver } from './resolvers/asset.resolver';
import { AuthResolver } from './resolvers/auth.resolver';
import { ChannelResolver } from './resolvers/channel.resolver';
import { CountryResolver } from './resolvers/country.resolver';
import { CustomerGroupResolver } from './resolvers/customer-group.resolver';
import { CustomerResolver } from './resolvers/customer.resolver';
import { FacetResolver } from './resolvers/facet.resolver';
import { GlobalSettingsResolver } from './resolvers/global-settings.resolver';
import { ImportResolver } from './resolvers/import.resolver';
import { OrderResolver } from './resolvers/order.resolver';
import { PaymentMethodResolver } from './resolvers/payment-method.resolver';
import { ProductCategoryResolver } from './resolvers/product-category.resolver';
import { ProductOptionResolver } from './resolvers/product-option.resolver';
import { ProductResolver } from './resolvers/product.resolver';
import { PromotionResolver } from './resolvers/promotion.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { SearchResolver } from './resolvers/search.resolver';
import { ShippingMethodResolver } from './resolvers/shipping-method.resolver';
import { TaxCategoryResolver } from './resolvers/tax-category.resolver';
import { TaxRateResolver } from './resolvers/tax-rate.resolver';
import { ZoneResolver } from './resolvers/zone.resolver';

const resolvers = [
    AdministratorResolver,
    AssetResolver,
    AuthResolver,
    ChannelResolver,
    CountryResolver,
    CustomerGroupResolver,
    CustomerResolver,
    FacetResolver,
    GlobalSettingsResolver,
    ImportResolver,
    OrderResolver,
    PaymentMethodResolver,
    ProductCategoryResolver,
    ProductOptionResolver,
    ProductResolver,
    PromotionResolver,
    RoleResolver,
    SearchResolver,
    ShippingMethodResolver,
    TaxCategoryResolver,
    TaxRateResolver,
    ZoneResolver,
];

/**
 * The ApiModule is responsible for the public API of the application. This is where requests
 * come in, are parsed and then handed over to the ServiceModule classes which take care
 * of the business logic.
 */
@Module({
    imports: [
        ServiceModule,
        DataImportModule,
        GraphQLModule.forRootAsync({
            useClass: GraphqlConfigService,
            imports: [ConfigModule, I18nModule],
        }),
        PluginModule,
    ],
    providers: [
        ...resolvers,
        RequestContextService,
        IdCodecService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AssetInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: IdInterceptor,
        },
    ],
})
export class ApiModule {}
