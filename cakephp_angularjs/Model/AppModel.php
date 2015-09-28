<?php
/**
 * Application model for Cake.
 *
 * This file is application-wide model file. You can put all
 * application-wide model-related methods here.
 *
 * PHP 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright 2005-2012, Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2005-2012, Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       app.Model
 * @since         CakePHP(tm) v 0.2.9
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

App::uses('Model', 'Model');

/**
 * Application model for Cake.
 *
 * Add your application-wide methods in the class below, your models
 * will inherit them.
 *
 * @package       app.Model
 */
class AppModel extends Model
{
    public $cache = false;

    public $recursive = -1;

    public $actsAs = array('Containable');

    private $clearListCache = true;

    protected $withPrivacy = false;

    protected $privacyFields = false;

    public function clearCache($type = 'list')
    {
        switch ($type) {
            case 'list':
                $this->clearListCache = true;
                break;
            default:
                break;
        }
        return $this;
    }

    public function getList($fields = ['id', 'name'], $order = [], $conditions = [])
    {
        $cacheName = $this->name.'_list_'.$fields[0].'_'.$fields[1];

        if (!empty($conditions)) {
            $cacheName .= '_' . md5(serialize($conditions));
        }

        if ($this->clearListCache) {
            Cache::delete($cacheName);
        }
        $get = Cache::read($cacheName);
        if (empty($get)) {
            $get = $this->find('list', [
                'order'      => $order,
                'fields'     => $fields,
                'conditions' => $conditions,
            ]);
            Cache::write($cacheName, $get);
        }
        return $get;
    }

    public function getLastQuery()
    {
        return end($this->getDatasource()->getLog(false, false)['log'])['query'];
    }

    public function getQueriesLog()
    {
        $dbo = $this->getDatasource();
        $logs = $dbo->getLog();

        return $logs;
    }

    public function filterValidationErrorsArr()
    {
        foreach ($this->validationErrors as $key => $value) {
            $isModel = array_key_exists($key, $this->hasAndBelongsToMany) ||
                       array_key_exists($key, $this->hasOne) ||
                       array_key_exists($key, $this->hasMany) ||
                       array_key_exists($key, $this->belongsTo);

            if (!$isModel) {
                $this->validationErrors[$this->alias] = isset($this->validationErrors[$this->alias])?
                    array_merge($this->validationErrors[$this->alias], array($key => $value)) : array($key => $value);
                unset($this->validationErrors[$key]);
            }
        }

        return $this->validationErrors;
    }

    public function generateConcatValue($idsArr = array())
    {
        $options = array(
            'conditions' => array(
                'id' => $idsArr
            ),
            'fields' => array('group_concat(title SEPARATOR ", ") as title'),
        );
        $data = $this->find('first', $options);

        return $data[0]['title'];
    }

    /**
     * Method concatenate all fields are in "title" field of contained models
     * and adding the result to the main model
     *
     * @param array $data
     * @param bool|int $limit - max symbols
     * @return array
     */
    public function concatContainedModels($data = array(), $limit = false)
    {
        foreach ($data as &$item) {
            foreach ($item as $modelName => $modelItems) {
                if ($modelName != $this->alias) {
                    $item[$this->alias][$modelName] = $limit?
                        String::truncate(implode(', ', Set::extract('/title', $modelItems)), $limit, array('exact' => false, 'ellipsis' => ' ...')):
                        implode(', ', Set::extract('/title', $modelItems));
                }
            }
        }

        return $data;
    }

    public function checkPrivacyAuthUser()
    {
        $this->withPrivacy = true;
        return $this;
    }

    public function getEntityAdmin($entityId = null, $additionalContains = array())
    {
        $contain = array('User');
        $options = array(
            'conditions' => array(
                $this->alias.'.id' => $entityId
            ),
            'contain' => array_merge($contain, $additionalContains)
        );

        $data = $this->find('first', $options);
        if (!empty($data['User'][0])) {
            $data['User'] = $data['User'][0];
        }
        return (!empty($data[$this->alias]) && !empty($data['User']))? $data : false;
    }

    public function getEntityContact($entityId)
    {
        $result = array();
        $columnEmail = array('Company' => 'email', 'Project' => 'contact_email');
        $options = array(
            'conditions' => array(
                $this->alias.'.id' => $entityId,
                array(
                    'not' => array(
                        $this->alias.'.'.$columnEmail[$this->alias] => null,
                        $this->alias.'.'.$columnEmail[$this->alias].' = "" ',
                    )
                )
            ),
            'fields' => array('*')
        );
        $data = $this->find('first', $options);
        if (!empty($data[$this->alias][$columnEmail[$this->alias]])) {
            $result['email'] = $data[$this->alias][$columnEmail[$this->alias]];
            $result['title'] = $data[$this->alias]['title'];
            $result['id'] = $data[$this->alias]['id'];
        } else {
            $getPrimary = $this->getEntityAdmin($entityId);
            if ($getPrimary) {
                $result['email'] = $getPrimary['User']['email'];
                $result['title'] = $getPrimary[$this->alias]['title'];
                $result['full_name'] = $getPrimary['User']['full_name'];
            }
        }

        return $result;
    }

    public function decryptSection($hash, $secretKey = 'ReAlC0n', $isArray = false)
    {
        $iv = substr(hash('sha256', 'Re@lC0n'), 0, 16);
        $data = openssl_decrypt(strtr($hash, '-_,', '+/='), 'AES-128-CFB', $secretKey, false, $iv);
        return $isArray?  json_decode($data, true) : $data;
    }

    public function encryptSection($data, $secretKey = 'ReAlC0n', $isArray = false)
    {
        $iv = substr(hash('sha256', 'Re@lC0n'), 0, 16);
        $data = $isArray? json_encode($data) : $data;
        return strtr(openssl_encrypt($data, 'AES-128-CFB', $secretKey, false, $iv), '+/=', '-_,');
    }

}
