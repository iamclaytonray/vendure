import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

import { Type } from '../../../shared/shared-types';
import { ProductTranslation } from '../entity/product/product-translation.entity';
import { Product } from '../entity/product/product.entity';
import { I18nError } from '../i18n/i18n-error';

import { SortParameter } from './common-types';
import { parseSortParams } from './parse-sort-params';

describe('parseSortParams()', () => {
    it('works with no params', () => {
        const connection = new MockConnection();
        connection.setColumns(Product, [{ propertyName: 'id' }, { propertyName: 'image' }]);

        const result = parseSortParams(connection as any, Product, []);
        expect(result).toEqual({});
    });

    it('works with a single param', () => {
        const connection = new MockConnection();
        connection.setColumns(Product, [{ propertyName: 'id' }, { propertyName: 'image' }]);

        const sortParams: SortParameter[] = [{ field: 'id', order: 'asc' }];

        const result = parseSortParams(connection as any, Product, sortParams);
        expect(result).toEqual({
            'product.id': 'ASC',
        });
    });

    it('defaults the order to "ASC', () => {
        const connection = new MockConnection();
        connection.setColumns(Product, [{ propertyName: 'id' }, { propertyName: 'image' }]);

        const sortParams: SortParameter[] = [{ field: 'id' } as any, { field: 'image', order: 'foo' } as any];

        const result = parseSortParams(connection as any, Product, sortParams);
        expect(result).toEqual({
            'product.id': 'ASC',
            'product.image': 'ASC',
        });
    });

    it('works with multiple params', () => {
        const connection = new MockConnection();
        connection.setColumns(Product, [
            { propertyName: 'id' },
            { propertyName: 'image' },
            { propertyName: 'createdAt' },
        ]);

        const sortParams: SortParameter[] = [
            { field: 'id', order: 'asc' },
            { field: 'createdAt', order: 'desc' },
            { field: 'image', order: 'asc' },
        ];

        const result = parseSortParams(connection as any, Product, sortParams);
        expect(result).toEqual({
            'product.id': 'ASC',
            'product.createdAt': 'DESC',
            'product.image': 'ASC',
        });
    });

    it('works with localized fields', () => {
        const connection = new MockConnection();
        connection.setColumns(Product, [{ propertyName: 'id' }, { propertyName: 'image' }]);
        connection.setRelations(Product, [{ propertyName: 'translations', type: ProductTranslation }]);
        connection.setColumns(ProductTranslation, [
            { propertyName: 'id' },
            { propertyName: 'name' },
            { propertyName: 'base', relationMetadata: {} as any },
        ]);

        const sortParams: SortParameter[] = [{ field: 'id', order: 'asc' }, { field: 'name', order: 'desc' }];

        const result = parseSortParams(connection as any, Product, sortParams);
        expect(result).toEqual({
            'product.id': 'ASC',
            'product_translations.name': 'DESC',
        });
    });

    it('works with custom fields', () => {
        const connection = new MockConnection();
        connection.setColumns(Product, [{ propertyName: 'id' }, { propertyName: 'infoUrl' }]);

        const sortParams: SortParameter[] = [{ field: 'infoUrl', order: 'asc' }];

        const result = parseSortParams(connection as any, Product, sortParams);
        expect(result).toEqual({
            'product.infoUrl': 'ASC',
        });
    });

    it('works with localized custom fields', () => {
        const connection = new MockConnection();
        connection.setColumns(Product, [{ propertyName: 'id' }]);
        connection.setRelations(Product, [{ propertyName: 'translations', type: ProductTranslation }]);
        connection.setColumns(ProductTranslation, [{ propertyName: 'id' }, { propertyName: 'shortName' }]);

        const sortParams: SortParameter[] = [{ field: 'shortName', order: 'asc' }];

        const result = parseSortParams(connection as any, Product, sortParams);
        expect(result).toEqual({
            'product_translations.shortName': 'ASC',
        });
    });

    it('throws if an invalid field is passed', () => {
        const connection = new MockConnection();
        connection.setColumns(Product, [{ propertyName: 'id' }, { propertyName: 'image' }]);
        connection.setRelations(Product, [{ propertyName: 'translations', type: ProductTranslation }]);
        connection.setColumns(ProductTranslation, [
            { propertyName: 'id' },
            { propertyName: 'name' },
            { propertyName: 'base', relationMetadata: {} as any },
        ]);

        const sortParams: SortParameter[] = [{ field: 'invalid', order: 'asc' }];

        try {
            parseSortParams(connection as any, Product, sortParams);
            fail('should not get here');
        } catch (e) {
            expect(e instanceof I18nError).toBe(true);
            expect(e.message).toBe('error.invalid-sort-field');
            expect(e.variables.fieldName).toBe('invalid');
            expect(e.variables.validFields).toEqual('id, image, name');
        }
    });
});

type PropertiesMap = {
    [name: string]: string | any;
};

class MockConnection {
    private columnsMap = new Map<Type<any>, Array<Partial<ColumnMetadata>>>();
    private relationsMap = new Map<Type<any>, Array<Partial<RelationMetadata>>>();
    setColumns(entity: Type<any>, value: Array<Partial<ColumnMetadata>>) {
        this.columnsMap.set(entity, value);
    }
    setRelations(entity: Type<any>, value: Array<Partial<RelationMetadata>>) {
        this.relationsMap.set(entity, value);
    }
    getMetadata = (entity: Type<any>) => {
        return {
            name: entity.name,
            columns: this.columnsMap.get(entity) || [],
            relations: this.relationsMap.get(entity) || [],
        };
    };
}