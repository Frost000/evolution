/*
 * Copyright 2023, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import { v4 as uuidV4 } from 'uuid';
import { BaseTrip, BaseTripAttributes, ExtendedTripAttributes } from '../BaseTrip';
import * as VPAttr from '../attributeTypes/VisitedPlaceAttributes';
import { BaseVisitedPlace, BaseVisitedPlaceAttributes } from '../BaseVisitedPlace';
import { BasePlace } from '../BasePlace';
import { BaseSegment, BaseSegmentAttributes } from '../BaseSegment';
import { Weight } from '../Weight';
import { WeightMethod } from '../WeightMethod';

const validUUID = uuidV4();

describe('BaseTrip', () => {
    const baseVisitedPlaceAttributes: BaseVisitedPlaceAttributes = {
        _uuid: uuidV4(),
        basePlace: new BasePlace({}),
        arrivalDate: new Date('2023-10-01'),
        departureDate: new Date(),
        arrivalTime: 36000, // 10:00 AM in seconds since midnight
        departureTime: 39600, // 11:00 AM in seconds since midnight
        activityCategory: 'leisure' as VPAttr.ActivityCategory,
        activity: 'leisureStroll' as VPAttr.Activity,
    };

    const weightMethodAttributes = {
        _uuid: uuidV4(),
        shortname: 'sample-shortname2',
        name: 'Sample Weight Method2',
        description: 'Sample weight method description2',
    };

    const baseTripAttributes: BaseTripAttributes = {
        _uuid: validUUID,
        _weights: [{ weight: 34.444, method: new WeightMethod(weightMethodAttributes) }],
        baseOrigin: new BaseVisitedPlace(baseVisitedPlaceAttributes),
        baseDestination: new BaseVisitedPlace(baseVisitedPlaceAttributes),
        baseSegments: [new BaseSegment({ _uuid: uuidV4() } as BaseSegmentAttributes), new BaseSegment({ _uuid: uuidV4() } as BaseSegmentAttributes)],
    };

    it('should create a new BaseTrip instance', () => {
        const trip = new BaseTrip(baseTripAttributes);
        expect(trip).toBeInstanceOf(BaseTrip);
        expect(trip._uuid).toEqual(validUUID);
        expect(trip.baseOrigin).toBeInstanceOf(BaseVisitedPlace);
        expect(trip.baseDestination).toBeInstanceOf(BaseVisitedPlace);
        expect(trip.baseSegments?.length).toEqual(2);
    });

    it('should create a new BaseTrip instance with minimal attributes', () => {
        const minimalAttributes: BaseTripAttributes = {
            _uuid: validUUID,
            baseSegments: [],
        };

        const trip = new BaseTrip(minimalAttributes);
        expect(trip).toBeInstanceOf(BaseTrip);
        expect(trip._uuid).toEqual(validUUID);
        expect(trip.baseOrigin).toBeUndefined();
        expect(trip.baseDestination).toBeUndefined();
        expect(trip.baseSegments).toEqual([]);
        expect(trip.baseSegments?.length).toEqual(0);
    });

    it('should validate a BaseTrip instance', () => {
        const trip = new BaseTrip(baseTripAttributes);
        expect(trip.isValid()).toBeUndefined();
        const validationResult = trip.validate();
        expect(validationResult).toBe(true);
        expect(trip.isValid()).toBe(true);
    });

    it('should accept extended attributes', () => {
        const extendedAttributes: ExtendedTripAttributes = {
            ...baseTripAttributes,
            customAttribute: 'Custom Value',
        };

        const trip = new BaseTrip(extendedAttributes);
        expect(trip).toBeInstanceOf(BaseTrip);
    });

    it('should set weight and method correctly', () => {
        const trip = new BaseTrip(baseTripAttributes);
        const weight: Weight = trip._weights?.[0] as Weight;
        expect(weight.weight).toBe(34.444);
        expect(weight.method).toBeInstanceOf(WeightMethod);
        expect(weight.method.shortname).toEqual('sample-shortname2');
        expect(weight.method.name).toEqual('Sample Weight Method2');
        expect(weight.method.description).toEqual('Sample weight method description2');
    });

    it('should return an empty array for valid parameters', () => {
        const params = {
            _uuid: uuidV4(),

            baseOrigin: new BaseVisitedPlace({}),
            baseDestination: new BaseVisitedPlace({}),
            baseSegments: [
                new BaseSegment({}),
                new BaseSegment({}),
            ],
        };

        const errors = BaseTrip.validateParams(params);
        expect(errors).toEqual([]);
    });

    it('should return errors for invalid parameters', () => {
        const params = {
            _uuid: 'invalid-uuid',
            baseOrigin: 'invalid-origin',
            baseDestination: new Date(),
            baseSegments: [
                {},
                'invalid-segment',
            ],
        };

        const errors = BaseTrip.validateParams(params);
        expect(errors).toHaveLength(5); // Two errors expected
        expect(errors).toEqual([
            new Error('Uuidable validateParams: invalid uuid'),
            new Error('BaseTrip validateParams: baseOrigin should be an object'),
            new Error('BaseTrip validateParams: baseDestination should be an object'),
            new Error('BaseTrip validateParams: baseSegments at index 0 should be an instance of BaseSegment'),
            new Error('BaseTrip validateParams: baseSegments at index 1 should be an instance of BaseSegment'),
        ]);
    });

    it('should accept empty params', () => {
        const params = {};
        const errors = BaseTrip.validateParams(params);
        expect(errors).toHaveLength(0);
    });

});
