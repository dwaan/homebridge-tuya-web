import {TuyaDevice, TuyaDeviceState} from '../../TuyaWebApi';
import {CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue} from 'homebridge';
import {TuyaWebCharacteristic} from './base';
import {BaseAccessory} from '../BaseAccessory';

export type OnCharacteristicData = { state: boolean | 'true' | 'false' }
type DeviceWithOnCharacteristic = TuyaDevice<TuyaDeviceState & OnCharacteristicData>

export class OnCharacteristic extends TuyaWebCharacteristic {
  public static Title = 'Characteristic.On'

  public static HomekitCharacteristic(accessory: BaseAccessory) {
    return accessory.platform.Characteristic.On;
  }

  public static isSupportedByAccessory(accessory): boolean {
    return accessory.deviceConfig.data.state !== undefined;
  }

  public getRemoteValue(callback: CharacteristicGetCallback): void {
    this.accessory.getDeviceState<OnCharacteristicData>().then((data) => {
      this.debug('[GET] %s', data?.state);
      this.updateValue(data, callback);
    }).catch(this.accessory.handleError('GET', callback));
      
  }

  public setRemoteValue(homekitValue: CharacteristicValue, callback: CharacteristicSetCallback): void {
    // Set device state in Tuya Web API
    const value = homekitValue ? 1 : 0;

    this.accessory.setDeviceState('turnOnOff', {value}, {state: homekitValue}).then(() => {
      this.debug('[SET] %s %s', homekitValue, value);
      callback();
    }).catch(this.accessory.handleError('SET', callback));
  }

  updateValue(data: DeviceWithOnCharacteristic['data'] | undefined, callback?: CharacteristicGetCallback): void {
    if (data?.state !== undefined) {
      const stateValue = (String(data.state).toLowerCase() === 'true');
      this.accessory.setCharacteristic(this.homekitCharacteristic, stateValue, !callback);
      callback && callback(null, stateValue);
    }
  }
}
